import { app, BrowserWindow, ipcMain, Tray, Menu, nativeTheme, globalShortcut, screen, shell } from "electron"
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import fs from 'fs'

import url from 'url'
import path from 'path'


let __filename = url.fileURLToPath(import.meta.url)
let __dirname = path.dirname(__filename)

// 检查是否存在数据文件，如果不存在则创建
const userDataPath = app.getPath('userData')
const dbDir = path.join(userDataPath, 'notes.json');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(userDataPath, { recursive: true });
    fs.writeFileSync(dbDir, JSON.stringify({ notes: [
        {
        "id": 1748093081561,
        "content": "---QUICK START---\n\nThank you for your Download! Hoping you enjoy using Quick Idea.\n\nuse Ctrl+Shift+A to open your first note.",
        "type": "saved",
        "date": "2025/5/24",
        "created_at": "2025-05-24T13:24:41.566Z"
        }
    ] }, null, 2));
}

// 初始化 lowdb
const adapter = new JSONFileSync(dbDir);
const db = new LowSync(adapter, { "notes": [] });
db.read();
if (!db.data || !db.data.notes) {
    db.data = { "notes": [] };
    db.write();
}

//创建窗口
let mainWindow = null
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 500, //设置窗口宽度(单位:像素)
        height: 600, //设置窗口高度
        minWidth: 400, //设置窗口最小宽度
        minHeight: 500, //设置窗口最小高度
        icon: path.resolve(__dirname, '../electron/resource/images/note.ico'), //设置窗口图标
        autoHideMenuBar:true, //隐藏菜单栏
        webPreferences: { //网页偏好设置
                nodeIntegration: true, //允许在渲染进程中直接使用 Node.js API
                contextIsolation: true, //启用上下文隔 (提高安全性)
                preload: path.resolve(__dirname,"preload.mjs"), //预加载脚本
        }
    })

    //VITE_DEV_SERVER_URL 是开发服务器的 url, 只在开发环境中存在
    if (process.env['VITE_DEV_SERVER_URL']) {
        //在开发环境中加载开发服务器的 url
        mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])      
    }else{
        //在生产环境中加载打包后的 index.html 文件
        mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html'))
    }

    mainWindow.on('close', (event) => {
        event.preventDefault() //阻止默认行为
        mainWindow.hide() //隐藏窗口
    })

    mainWindow.on('closed',()=>{
        mainWindow = null; // 避免内存泄漏
    })
}

// 创建托盘图标
const createTray = () => {
    const icon = path.resolve(__dirname, '../electron/resource/images/note.ico');
    let trayTemplate = [
        {
            label:'exit',
            click:() => {
                mainWindow.destroy();
                app.quit();
            }
        }
    ]

    const traymenu = Menu.buildFromTemplate(trayTemplate);
    const tray = new Tray(icon);
    tray.setContextMenu(traymenu);

    // 点击托盘图标时显示窗口
    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
}

// 创建笔记窗口
function createNoteEditorWindow(mousePosition) {
    // 不再判断 noteEditorWindow 是否存在，直接创建新窗口
    const noteEditorWindow = new BrowserWindow({
        width: 400,
        height: 300,
        minWidth: 300,
        minHeight: 200,
        x: mousePosition.x,
        y: mousePosition.y,
        frame: false, 
        alwaysOnTop: true,
        resizable: true, 
        icon: path.resolve(__dirname, '../electron/resource/images/note.ico'), //设置窗口图标
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.resolve(__dirname, "preload.mjs"),
        }
    });

    // 加载编辑页面
    if (process.env['VITE_DEV_SERVER_URL']) {
        noteEditorWindow.loadURL(process.env['VITE_DEV_SERVER_URL'] + '#/note');
    } else {
        noteEditorWindow.loadFile(path.resolve(__dirname, '../dist/index.html'), { hash: '#/note' });
    }

    noteEditorWindow.on('closed', () => {
        noteEditorWindow.destroy();
    });
}


//当应用准备就绪后创建窗口
app.whenReady().then(() => {
    createWindow()
    createTray()

    globalShortcut.register('Ctrl+Shift+A', () => {
        // 获取鼠标位置
        const cursor = screen.getCursorScreenPoint();
        createNoteEditorWindow(cursor);
    });
})

// 退出时注销快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});


ipcMain.handle('changeTheme', (event, theme) => {
    if (theme === 'dark') {
        nativeTheme.themeSource = 'dark';
        return 'dark';
    } else {
        nativeTheme.themeSource = 'light';
        return 'light';
    }
})

ipcMain.handle('getTheme', (event) => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
})


// 保存笔记
ipcMain.handle('saveNote', (event, content, type) => {
    db.read();
    const note = {
        id: Date.now(),
        content: content,
        type: type,
        date: new Date().toLocaleDateString(),
        created_at: new Date().toISOString()
    };
    db.data.notes.unshift(note);
    db.write();
    return { id: note.id };
});

// 获取所有笔记
ipcMain.handle('getNotes', (event, type) => {
    db.read();
    if (type) {
        return db.data.notes.filter(note => note.type === type);
    }
});

// 根据 id 获取单条笔记
ipcMain.handle('getNoteById', (event, id) => {
    db.read();
    return db.data.notes.find(note => note.id === id) || [];
});

// 删除笔记
ipcMain.handle('deleteNote', (event, id) => {
    db.read();
    const index = db.data.notes.findIndex(note => note.id === id);
    if (index !== -1) {
        db.data.notes.splice(index, 1);
        db.write();
        return true;
    }
    return false;
});

// 更新笔记
ipcMain.handle('updateNote', (event, id, content) => {
    db.read();
    const note = db.data.notes.find(note => note.id === id);
    if (note) {
        note.content = content;
        db.write();
        return true;
    }
    return false;
});

// 打开链接
ipcMain.handle('openLink', (event, url) => {
    shell.openExternal(url);
});