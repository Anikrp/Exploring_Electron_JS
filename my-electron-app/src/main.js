const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
let mainWindow;
let server;
let authToken = null;

function createWindow() {
    // Initialize the Express server
    server = require('./backend/server');
    
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Load the login page by default
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'views', 'login.html'));
}

// Helper function for API requests
async function makeAuthenticatedRequest(url, options = {}) {
    try {
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
        const fullUrl = `${baseUrl}${url}`;

        if (authToken) {
            options.headers = {
                ...options.headers,
                'Authorization': `Bearer ${authToken}`
            };
        }

        console.log(`Making request to: ${fullUrl}`);
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw new Error(error.message || 'An error occurred. Please try again.');
    }
}

// IPC Handlers
ipcMain.handle('login', async (event, credentials) => {
    try {
        console.log('Attempting login with:', credentials.email);
        const data = await makeAuthenticatedRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (data.token) {
            authToken = data.token;
            console.log('Login successful, redirecting to dashboard');
            mainWindow.loadFile(path.join(__dirname, 'frontend', 'views', 'dashboard.html'));
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        ipcMain.emit('handleError', error);
        throw error;
    }
});

ipcMain.handle('signup', async (event, userData) => {
    try {
        console.log('Attempting signup with:', userData.email);
        const data = await makeAuthenticatedRequest('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        console.log('Signup successful, redirecting to login');
        mainWindow.loadFile(path.join(__dirname, 'frontend', 'views', 'login.html'));
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        ipcMain.emit('handleError', error);
        throw error;
    }
});

ipcMain.handle('logout', async () => {
    console.log('Logging out user');
    authToken = null;
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'views', 'login.html'));
});

ipcMain.handle('getUserData', async () => {
    try {
        return await makeAuthenticatedRequest('/api/auth/user');
    } catch (error) {
        console.error('Get user data error:', error);
        ipcMain.emit('handleError', error);
        throw error;
    }
});

ipcMain.handle('updateUserData', async (event, data) => {
    try {
        return await makeAuthenticatedRequest('/api/auth/user', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Update user data error:', error);
        ipcMain.emit('handleError', error);
        throw error;
    }
});

ipcMain.handle('showNotification', (event, { title, body, type = 'info' }) => {
    new Notification({
        title: title || 'Electron App',
        body: body || '',
        icon: type === 'error' ? path.join(__dirname, 'assets', 'error.png') : undefined
    }).show();
});

ipcMain.handle('handleError', (event, error) => {
    console.error('Application error:', error);
    new Notification({
        title: 'Error',
        body: error.message || 'An error occurred'
    }).show();
});

// App lifecycle handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (server) {
            server.close(() => {
                app.quit();
            });
        } else {
            app.quit();
        }
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});