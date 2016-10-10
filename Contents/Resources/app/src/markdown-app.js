import {
    ipcRenderer
} from 'electron';

class markdownApp extends HTMLElement {

    beforeRegister() {
        this.is = 'markdown-app';
    }

    inputFileChangeHandler(evt) {
        if (evt.target.value === '') {
            return;
        }
        const file = evt.target.files[0];

        localStorage.setItem('fileName', file.name);

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const text = reader.result;
            localStorage.setItem('fileContent', text);
        });
        reader.readAsText(file);
    }

    preview() {
        ipcRenderer.send('request-preview-window', this.title);
    }

    print() {
        const filename = localStorage.getItem('fileName');
        ipcRenderer.send('print-as-pdf', filename);
    }
}

Polymer(markdownApp);