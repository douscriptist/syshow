const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const slash = require('slash');
const log = require('electron-log');
const Store = require('./Store');

const isDevMode = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;

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

function createMainWindow() {
	mainWindow = new BrowserWindow({
		title: 'SysHow',
		width: isDevMode ? 650 : 400,
		height: 500,
		icon: `${__dirname}/assets/icons/icon.png`,
		resizable: isDevMode,
		backgroundColor: '#252b4d',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true, // electron-log
		},
		autoHideMenuBar: true,
	});

	// Is development mode open developer tools default
	isDevMode && mainWindow.webContents.openDevTools();

	mainWindow.loadFile(`${__dirname}/app/index.html`);
}

// LATER: Squirrel - https://github.com/electron/windows-installer/blob/master/README.md#handling-squirrel-events
// Notification bottom
app.setAppUserModelId('HowSys');

app.on('ready', () => {
	createMainWindow();

	// Sending default settings on create window
	mainWindow.webContents.on('dom-ready', () => {
		sendSettings();
	});

	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
});

const menu = [
	// For mac file option
	...(isMac ? [{ role: 'appMenu' }] : []),
	{ role: 'fileMenu' },
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
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});
