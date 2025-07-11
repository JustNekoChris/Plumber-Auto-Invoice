console.log('Hello World!')

const env = process.env.NODE_ENV || 'development';
const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')

if (env === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        // titleBarStyle: 'hidden',
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {

    ipcMain.handle('ping', () => 'pong')
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

const fs = require('fs');
const { dialog } = require('electron');

ipcMain.handle('generate-pdf', async (event, workOrderData) => {
    const { filePath } = await dialog.showSaveDialog({
        defaultPath: 'workorder.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) {
        await generateWorkOrderPDF(workOrderData, filePath);
        return filePath;
    } else {
        throw new Error('Save canceled');
    }
});

function generateWorkOrderPDF(workOrderData, outputPath) {
    return new Promise((resolve, reject) => {
        const win = new BrowserWindow({
            width: 800,
            height: 600,
            show: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            }
        });

        win.loadFile('workorder.html');

        win.webContents.once('did-finish-load', () => {
            win.webContents.executeJavaScript(`window.workOrderData = ${JSON.stringify(workOrderData)}`)
                .then(() => {
                    setTimeout(() => {
                        win.webContents.printToPDF({}).then(dataBuffer => {
                            fs.writeFile(outputPath, dataBuffer, (err) => {
                                win.close();
                                if (err) reject(err);
                                else resolve(outputPath);
                            });
                        }).catch(reject);
                    }, 100);
                })
                .catch(reject);
        });
    });
}
