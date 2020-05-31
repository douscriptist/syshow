const { BrowserWindow } = require('electron');

class MainWindow extends BrowserWindow {
	constructor(file, isDev) {
		super({
			title: 'SysHow',
			width: isDev ? 650 : 400,
			height: 500,
			icon: `${__dirname}/assets/icons/icon.png`,
			resizable: isDev,
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

		this.loadFile(file);

		// Is development mode open developer tools default
		isDev && this.webContents.openDevTools();
	}
}

module.exports = MainWindow;
