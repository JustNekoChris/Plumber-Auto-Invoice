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

function openWorkOrderPreview(workOrderData) {
  const previewWin = new BrowserWindow({
    width: 850,  // Letter width approx + some margin
    height: 1100, // Letter height approx + some margin
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  previewWin.loadFile('workorder.html').then(() => {
    // Inject the data as a global variable for the renderer
    previewWin.webContents.executeJavaScript(`window.workOrderData = ${JSON.stringify(workOrderData)};`).then(() => {
      // Optionally, send a signal so the renderer knows to render
      previewWin.webContents.executeJavaScript(`if(window.renderWorkOrder) window.renderWorkOrder(window.workOrderData);`);
    });
  });

  previewWin.webContents.openDevTools();

  previewWin.on('closed', () => {
    // Clean up if needed
  });

  return previewWin;
}

app.whenReady().then(() => {
  createWindow();

  // Example: open preview window with some sample data:
  const sampleData = {
    proposalToName: 'John Doe',
    jobName: 'New Kitchen Remodel',
    address: '123 Main St, Oakland, CA',
    jobLocation: 'Backyard',
    date: '2025-07-11',
    datePlans: '2025-06-30',
    phone: '(510) 123-4567',
    email: 'john@example.com',
    architect: 'Jane Architect',
    procedures: [
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Install new pipes', cost: 2500 },
      { description: 'Replace sink', cost: 400 }
    ],
    totalCost: 2900,
    paymentFollow: '50% upfront, 50% on completion',
    submittedBy: 'Oakland Rooter Team',
    withdrawPeriod: '30',
    signatureCustomer: '',
    dateAccepted: '',
    signatureCompany: ''
  };

//   openWorkOrderPreview(sampleData);
});


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

    ipcMain.once('render-complete', () => {
      // Now that the page is rendered with the data, print to PDF
      win.webContents.printToPDF({})
        .then(dataBuffer => {
          fs.writeFile(outputPath, dataBuffer, err => {
            win.close();
            if (err) reject(err);
            else resolve(outputPath);
          });
        })
        .catch(err => {
          win.close();
          reject(err);
        });
    });

    win.loadFile('workorder.html').then(() => {
      win.webContents.executeJavaScript(`window.workOrderData = ${JSON.stringify(workOrderData)}`);
    }).catch(reject);
  });
}