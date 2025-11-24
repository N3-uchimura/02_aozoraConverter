/*
 * aozoraconverter.ts
 *
 * aozorarecorder - aozora converting tools -
 **/

'use strict';

/// Constants
// namespace
import { myConst, myNums } from './consts/globalvariables';

/// Modules
import * as path from 'node:path'; // path
import { existsSync } from 'node:fs'; // file system
import { readFile, writeFile, readdir } from 'node:fs/promises'; // file system (Promise)
import { BrowserWindow, app, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'; // electron

import NodeCache from "node-cache"; // node-cache
import ELLogger from './class/ElLogger'; // logger
import Dialog from './class/ElDialog1124'; // dialog
import FileManage from './class/ELFileManage1025'; // file operation
import Ffmpeg from './class/ElFfmpeg'; // mdkir

// log level
const LOG_LEVEL: string = myConst.LOG_LEVEL ?? 'all';
// loggeer instance
const logger: ELLogger = new ELLogger(myConst.COMPANY_NAME, myConst.APP_NAME, LOG_LEVEL);
// dialog instance
const dialogMaker: Dialog = new Dialog(logger);
// filemanage instance
const fileManager = new FileManage(logger);
// ffmpeg instance
const ffmpegManager = new Ffmpeg(logger);
// cache instance
const cacheMaker: NodeCache = new NodeCache();

/// interfaces
// window option
interface windowOption {
  width: number; // window width
  height: number; // window height
  defaultEncoding: string; // default encode
  webPreferences: Object; // node
}



/*
 main
*/
// main window
let mainWindow: Electron.BrowserWindow;
// quit flg
let isQuiting: boolean;
// global path
let globalRootPath: string;

// set rootpath
if (!myConst.DEVMODE) {
  globalRootPath = path.join(path.resolve(), 'resources');
} else {
  globalRootPath = path.join(__dirname, '..');
}

// set rootpath
if (!myConst.DEVMODE) {
  globalRootPath = path.join(path.resolve(), 'resources');
} else {
  globalRootPath = path.join(__dirname, '..');
}
// file root path
const fileRootPath: string = path.join(globalRootPath, 'file');

// create main window
const createWindow = (): void => {
  try {
    // window options
    const windowOptions: windowOption = {
      width: myNums.WINDOW_WIDTH, // window width
      height: myNums.WINDOW_HEIGHT, // window height
      defaultEncoding: myConst.DEFAULT_ENCODING, // encoding
      webPreferences: {
        nodeIntegration: false, // node
        contextIsolation: true, // isolate
        preload: path.join(__dirname, "preload.js"), // preload
      }
    }
    // Electron window
    mainWindow = new BrowserWindow(windowOptions);
    // hide menubar
    mainWindow.setMenuBarVisibility(false);
    // index.html load
    mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // ready
    mainWindow.once('ready-to-show', () => {
      // dev mode
      if (!app.isPackaged) {
        //mainWindow.webContents.openDevTools();
      }
    });

    // stay at tray
    mainWindow.on('will-resize', (event: any): void => {
      // avoid Wclick
      event.preventDefault();
      // hide window
      mainWindow.hide();
      // returnfalse
      event.returnValue = false;
    });

    // close window
    mainWindow.on('close', (event: any): void => {
      // not closing
      if (!isQuiting && process.platform !== 'darwin') {
        // quit
        app.quit();
        // return false
        event.returnValue = false;
      }
    });

    // closing
    mainWindow.on('closed', (): void => {
      // destroy window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    logger.error(e);
  }
}

// enable sandbox
app.enableSandbox();

// main app
app.on('ready', async () => {
  try {
    logger.info('app: electron is ready');
    // create window
    createWindow();
    // menu label
    let displayLabel: string = '';
    // close label
    let closeLabel: string = '';
    // txt path
    const languageTxtPath: string = path.join(globalRootPath, 'assets', 'language.txt');
    // not exists
    if (!existsSync(languageTxtPath)) {
      logger.debug('app: making txt ...');
      // make txt file
      await writeFile(languageTxtPath, 'japanese');
    }
    // get language
    const language = await readFile(languageTxtPath, 'utf8');
    logger.debug(`language is ${language}`);
    // japanese
    if (language == 'japanese') {
      // set menu label
      displayLabel = '表示';
      // set close label
      closeLabel = '閉じる';
    } else {
      // set menu label
      displayLabel = 'show';
      // set close label
      closeLabel = 'close';
    }
    // cache
    cacheMaker.set('language', language);
    // make root dir
    await fileManager.mkDir(fileRootPath);
    // make root dir
    await fileManager.mkDir(path.join(fileRootPath, 'output'));
    // icons
    const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(globalRootPath, 'assets', 'aozora1.ico'));
    // tray
    const mainTray: Electron.Tray = new Tray(icon);
    // context menu
    const contextMenu: Electron.Menu = Menu.buildFromTemplate([
      // show
      {
        label: displayLabel,
        click: () => {
          mainWindow.show();
        }
      },
      // close
      {
        label: closeLabel,
        click: () => {
          app.quit();
        }
      }
    ]);
    // context menu
    mainTray.setContextMenu(contextMenu);
    // Wclick reopen
    mainTray.on('double-click', () => mainWindow.show());

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// activate
app.on('activate', () => {
  // no window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reload
    createWindow();
  }
});

// close
app.on('before-quit', () => {
  // turn on close flg
  isQuiting = true;
});

// end
app.on('window-all-closed', () => {
  logger.info('app: close app');
  // exit
  app.quit();
});

/*
 IPC
*/
// ready
ipcMain.on("beforeready", async (event: any, _) => {
  logger.info("app: beforeready app");
  // language
  const language = cacheMaker.get('language') ?? '';
  // be ready
  event.sender.send("ready", {
    language: language,
  });
});

// selectdir
ipcMain.on('selectdir', async (_, __) => {
  try {
    logger.info('ipc: selectdir mode');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // status message
    let finishedMessage: string = '';
    // switch on language
    if (language == 'japanese') {
      // set finish message
      finishedMessage = 'ディレクトリを選択してください。';
    } else {
      // set finish message
      finishedMessage = 'Select directory.';
    }
    // 対象ディレクトリ
    const targetPath: string = await dialogMaker.showFileDialog(mainWindow, ['openDirectory'], finishedMessage, '', ['']);
    // cache
    cacheMaker.set('path', targetPath);
  } catch (e) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// convert
ipcMain.on('convert', async (_, __) => {
  try {
    logger.info('app: convert app');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // wav path
    const targetPath: string = cacheMaker.get('path') ?? '';
    // output dir path
    const outputDir: string = path.join(fileRootPath, 'output');
    // file list in subfolder
    const audioFiles: string[] = (await readdir(targetPath)).filter((ad: string) => path.parse(ad).ext == '.wav');
    // operate each
    for await (const audioname of audioFiles) {
      // original wav path
      const originalWavPath: string = path.join(targetPath, audioname);
      // partial output path
      const partialFinalPath: string = path.join(outputDir, `${path.parse(audioname).name}.m4a`);
      // convert to m4a
      await ffmpegManager.convertAudioToM4a(originalWavPath, partialFinalPath, 10000, 100000);
    }
    // status message
    let finishedMessage: string = '';
    // switch on language
    if (language == 'japanese') {
      // set finish message
      finishedMessage = '完了しました';
    } else {
      // set finish message
      finishedMessage = 'Finished.';
    }
    // finish message
    dialogMaker.showmessage('info', finishedMessage);
    logger.info('ipc: operation finished.');

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// delete
ipcMain.on('delete', async (_, __) => {
  try {
    logger.info('app: delete app');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // status message
    let finishedMessage: string = '';
    // switch on language
    if (language == 'japanese') {
      // set finish message
      finishedMessage = '完了しました';
    } else {
      // set finish message
      finishedMessage = 'Finished.';
    }
    // finish message
    dialogMaker.showmessage('info', finishedMessage);
    logger.info('ipc: operation finished.');

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// config
ipcMain.on('config', async (event: any, _) => {
  try {
    logger.info('app: config app');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // goto config page
    await mainWindow.loadFile(path.join(globalRootPath, 'www', 'config.html'));
    // language
    event.sender.send('confready', language);

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// save
ipcMain.on('save', async (event: any, arg: any) => {
  try {
    logger.info('app: save config');
    // language
    const language: string = String(arg.language);
    // txt path
    const languageTxtPath: string = path.join(globalRootPath, "assets", "language.txt");
    // make txt file
    await writeFile(languageTxtPath, language);
    // cache
    cacheMaker.set('language', language);
    // goto config page
    await mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // language
    event.sender.send('ready', language);

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

ipcMain.on('top', async (event: any, _) => {
  try {
    logger.info('app: top');
    // goto config page
    await mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // language
    const language = cacheMaker.get('language') ?? '';
    // language
    event.sender.send('ready', language);

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// exit
ipcMain.on('exit', async () => {
  try {
    logger.info('ipc: exit mode');
    // title
    let questionTitle: string = '';
    // message
    let questionMessage: string = '';
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // japanese
    if (language == 'japanese') {
      questionTitle = '終了';
      questionMessage = '終了していいですか';
    } else {
      questionTitle = 'exit';
      questionMessage = 'exit?';
    }
    // selection
    const selected: number = dialogMaker.showQuetion('question', questionTitle, questionMessage);

    // when yes
    if (selected == 0) {
      // close
      app.quit();
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});
