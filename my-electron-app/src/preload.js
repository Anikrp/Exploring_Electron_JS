// This file is used to expose certain APIs to the renderer process in Electron, allowing secure communication between the frontend and backend. 

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Authentication methods
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    signup: (userData) => ipcRenderer.invoke('signup', userData),
    logout: () => ipcRenderer.invoke('logout'),
    
    // User data methods
    getUserData: () => ipcRenderer.invoke('getUserData'),
    updateUserData: (data) => ipcRenderer.invoke('updateUserData', data),
    
    // Utility methods
    showNotification: (message) => ipcRenderer.invoke('showNotification', message),
    handleError: (error) => ipcRenderer.invoke('handleError', error)
});