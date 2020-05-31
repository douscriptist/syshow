const path = require('path');
const {
	app,
	BrowserWindow,
	Menu,
	ipcMain,
	Tray,
	globalShortcut,
} = require('electron');
const slash = require('slash');
const log = require('electron-log');
const Store = require('./Store');

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
		// autoHideMenuBar: true,
		// frame: false,
		show: false,
		opacity: 0.88,
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

	// add shortcut to hide app as tray
	globalShortcut.register('Esc', () => {
		mainWindow.hide();
	});

	// Menu etc
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);

	// Tray icon
	const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');
	tray = new Tray(icon);
	tray.setToolTip('SysHow'); // set Label
	// tray.displayBalloon({
	// 	title: 'S',
	// 	content: 'H',
	// 	iconType: 'info',
	// 	largeIcon: false,
	// });

	// Double Click - Show/Hide
	tray.on('double-click', () => {
		mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
	});

	// Tray right click menu
	const contextMenu = Menu.buildFromTemplate(rightClickMenu);
	tray.setContextMenu(contextMenu); // tray.popUpContextMenu(contextMenu);

	// Right Click
	// tray.on('right-click', () => {});

	mainWindow.on('close', (e) => {
		if (!app.isQuitting) {
			e.preventDefault();
			mainWindow.hide();
		} else {
			return true;
		}

		// LATER:
		!tray.isDestroyed() &&
			tray.displayBalloon({
				title: 'SysHow',
				content: 'We are taking care of your computer, silently. :)',
				iconType: 'info',
				largeIcon: false,
			});
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

const rightClickMenu = [
	{
		label: 'Hello',
		click: () => console.log('hello'),
	},
	{
		label: 'Run on start',
		click: () => console.log((rightClickMenu[1].checked = true)),
		checked: true,
	},
	{
		label: 'Quit',
		click: () => {
			app.isQuitting = true;
			app.quit();
		},
	},
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
