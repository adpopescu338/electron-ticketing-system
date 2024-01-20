import { contextBridge } from 'electron';

// Expose the 'isInElectron' function to the renderer process
contextBridge.exposeInMainWorld('isInElectron', () => true);
