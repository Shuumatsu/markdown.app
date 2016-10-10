import {
    app,
    BrowserWindow,
    ipcMain,
    shell
} from 'electron';
import {
    downloads
} from 'user-path';
const debug = require('debug')('main');

import path from 'path';
import fs from 'fs';

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
    mainWindow = new BrowserWindow({
        height: 800,
        width: 1280
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.loadURL(`file://${__dirname}/windows/main.html`);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('request-preview-window', () => {
    let win = new BrowserWindow({
        height: 800,
        width: 1280,
    });

    win.on('closed', () => {
        win = null;
    });

    win.loadURL(`file://${__dirname}/windows/preview.html`);
});

ipcMain.on('print-as-pdf', async(evt, filename) => {
    const win = BrowserWindow.fromWebContents(evt.sender);

    let [err, buffer] = await promisify(win.webContents.printToPDF, win.webContents)({
        pageSize: 'A4'
    });
    if (err) {
        console.log('win.webContents.printToPDF', err);
        return;
    }

    // filename = filename.replace(/(\.[^/.]+)$/, '');
    let filePath = path.join(downloads(), `${filename}.pdf`);

    err = await errorOnlyPromisify(fs.open, fs)(filePath, 'w+');
    if (err) {
        console.log('fs.open', err);
        return;
    }

    err = await promisify(fs.writeFile, fs)(filePath, buffer);
    if (err) {
        console.log('fs.writeFile', err);
        return;
    }

    shell.openExternal('file://' + downloads());
});


ipcMain.on('log', (evt, ...values) => {
    debug(values);
});