const { app, Menu, Tray } = require('electron');

class SysHowTray extends Tray {
	constructor(icon, mainWindow) {
		super(icon);
		this.mainWindow = mainWindow;

		this.setToolTip('SysHow'); // set Label

		this.on('double-click', this.doubleClick);
		this.on('right-click', this.rightClick);

		// Tray right click menu

		this.setContextMenu(contextMenu);
		// this.popUpContextMenu(contextMenu);
	}

	// Double Click - Show/Hide
	doubleClick = () => {
		this.mainWindow.isVisible()
			? this.mainWindow.hide()
			: this.mainWindow.show();
	};

	// Right Click
	rightClick = () => {
		console.log('Right Clicked Tray Icon');
	};

	// Show running info Balloon
	showInfoBalloon = (content, iconType) => {
		this.displayBalloon({
			title: 'SysHow',
			content,
			iconType,
			largeIcon: false,
		});
	};
}

const RIGHT_CLICK_MENU = [
	{
		label: 'Hello',
		click: () => console.log('hello'),
	},
	{
		label: 'Run on start',
		click: () => console.log('(rightClickMenu[1].checked = true)'),
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

const contextMenu = Menu.buildFromTemplate(RIGHT_CLICK_MENU);

module.exports = SysHowTray;
