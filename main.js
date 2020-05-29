const { app, BrowserWindow, Menu } = require('electron');
const slash = require('slash');
const log = require('electron-log');

const isDevMode = process.env.NODE_ENV !== 'production' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;

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
