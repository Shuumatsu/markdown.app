'use strict';

var _electron = require('electron');

var _userPath = require('user-path');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = require('debug')('main');

function errorOnlyPromisify(fn, ctx) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(ctx, [...args, function (err) {
                resolve(err);
            }.bind(ctx)]);
        });
    };
}

function errorRejectPromisify(fn, ctx) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn.apply(ctx, [...args, function (err, ...res) {
                if (res.length <= 1) {
                    err ? reject(err) : resolve(...res);
                    return;
                }
                err ? reject(err) : resolve(res);
            }.bind(ctx)]);
        });
    };
}

function promisify(fn, ctx) {
    return (...args) => {
        return new Promise(resolve => {
            fn.apply(ctx, [...args, function (...res) {
                if (res.length <= 1) {
                    resolve(...res);
                    return;
                }
                resolve(res);
            }.bind(ctx)]);
        });
    };
}

let mainWindow;

function createWindow() {
    mainWindow = new _electron.BrowserWindow({
        height: 800,
        width: 1280
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.loadURL(`file://${ __dirname }/windows/main.html`);
}

_electron.app.on('ready', createWindow);

_electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        _electron.app.quit();
    }
});

_electron.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

_electron.ipcMain.on('request-preview-window', () => {
    let win = new _electron.BrowserWindow({
        height: 800,
        width: 1280
    });

    win.on('closed', () => {
        win = null;
    });

    win.loadURL(`file://${ __dirname }/windows/preview.html`);
});

_electron.ipcMain.on('print-as-pdf', (() => {
    var _ref = _asyncToGenerator(function* (evt, filename) {
        const win = _electron.BrowserWindow.fromWebContents(evt.sender);

        let [err, buffer] = yield promisify(win.webContents.printToPDF, win.webContents)({
            pageSize: 'A4'
        });
        if (err) {
            console.log('win.webContents.printToPDF', err);
            return;
        }

        // filename = filename.replace(/(\.[^/.]+)$/, '');
        let filePath = _path2.default.join((0, _userPath.downloads)(), `${ filename }.pdf`);

        err = yield errorOnlyPromisify(_fs2.default.open, _fs2.default)(filePath, 'w+');
        if (err) {
            console.log('fs.open', err);
            return;
        }

        err = yield promisify(_fs2.default.writeFile, _fs2.default)(filePath, buffer);
        if (err) {
            console.log('fs.writeFile', err);
            return;
        }

        _electron.shell.openExternal('file://' + (0, _userPath.downloads)());
    });

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
})());

_electron.ipcMain.on('log', (evt, ...values) => {
    debug(values);
});