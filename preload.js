const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

contextBridge.exposeInMainWorld('api', {
  saveCanvas: (name) => {
    const canvas = document.getElementById('viewport');

    return new Promise((res, rej) => {
      const folderPath = path.join(__dirname, 'certificados');
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      canvas.toBlob((blob) => {
        blob.arrayBuffer().then((arrayBuffer) => {
          const uint8Array  = new Uint8Array(arrayBuffer);
          fs.writeFile(`${folderPath}/${name}.png`, uint8Array, (err) => {
            if (err) {
              rej(err);
            }
            res();
          })
        })
      })
    })
  },
  capture: info => {
    ipcRenderer.removeAllListeners('capture-reply');
    return new Promise((res) => {
      ipcRenderer.on('capture-reply', () => {
        res();
      })
      setTimeout(() => {
        const nameElement = document.getElementById('name');
        nameElement.innerHTML = info.name;

        ipcRenderer.send('capture', info);
      }, 100)
    })
  },
  readXLSX: file => {
    const workbook = xlsx.readFile(file);
    return workbook;
  }
});