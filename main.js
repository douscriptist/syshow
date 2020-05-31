const path = require('path');
const { app, Menu, ipcMain, globalShortcut } = require('electron');
const slash = require('slash');
const log = require('electron-log');

const Store = require('./Store');
const MainWindow = require('./MainWindow');
const SysHowTray = require('./SysHowTray');

process.env.NODE_ENV = 'production';
const isDevMode = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let tray;

// Init Store and Defaults
const store = new Store({
	configName: 'user-settings',
	defaults: {
		settings: {
			cpuOverload: 75,
			ramOverload: 80,
			alertFrequency: 5,
			theme: 'dark',
		},
	},
});

// LATER: Squirrel - https://github.com/electron/windows-installer/blob/master/README.md#handling-squirrel-events
// Notification bottom
app.setAppUserModelId('HowSys');

app.on('ready', () => {
	createMainWindow();

	// Sending default settings on create window
	mainWindow.webContents.on('dom-ready', () => {
		sendSettings();
	});

	// add shortcut to hide app as tray
	globalShortcut.register('Esc', () => {
		mainWindow.hide();
	});

	// Menu etc
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	// Tray icon
	const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');

	// Init tray
	tray = new SysHowTray(icon, mainWindow);

	mainWindow.on('close', (e) => {
		if (!app.isQuitting) {
			e.preventDefault();
			mainWindow.hide();
		} else {
			return true;
		}
		// LATER: check for sth.
		!tray.isDestroyed() &&
			tray.showInfoBalloon(
				'We are taking care of your computer, silently. :)',
				'info'
			);
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
});

const menu = [
	// For mac file option
	...(isMac ? [{ role: 'appMenu' }] : []),
	{ role: 'fileMenu' },
	{
		label: 'View',
		submenu: [
			{
				label: 'Toggle Navigation',
				accelerator: 'CmdOrCtrl+H',
				click: () => mainWindow.webContents.send('nav:toggle'),
			},
		],
	},
	...(isDevMode
		? [
				{
					label: 'Development',
					submenu: [
						{ role: 'reload' },
						{ role: 'forcereload' },
						{ type: 'separator' },
						{ role: 'toggledevtools' },
					],
				},
		  ]
		: []),
];

// Set settings
ipcMain.on('settings:set', (e, settings) => {
	store.set('settings', settings);
	sendSettings();
	console.log(settings);
});

// Sending settings to the renderer
function sendSettings() {
	mainWindow.webContents.send('settings:get', store.get('settings'));
}

app.on('window-all-closed', () => {
	if (!isMac) {
		app.quit();
	}
});

app.on('activate', () => {
	// BrowserWindow.getAllWindows ?
	// MainWindow.getAllWindows ?
	if (mainWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});

// Create main window as MainWindow class whic extends BrowserWindow
function createMainWindow() {
	mainWindow = new MainWindow(`${__dirname}/app/index.html`, isDevMode);
}
