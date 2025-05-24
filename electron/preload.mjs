import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', {
    invokeWithData: async (channel, ...arges) => {
        return await ipcRenderer.invoke(channel, ...arges);
    },
    invoke: async (channel) => {
        return await ipcRenderer.invoke(channel);
    },
});