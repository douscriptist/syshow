const path = require('path');
const osCore = require('os');
const osu = require('node-os-utils');

const os = osu.os;
const cpu = osu.cpu;
const mem = osu.mem;

let CPU_OVERLOAD_PERCENTAGE = 80;
let MEMORY_OVERLOAD_PERCENTAGE = 80;
let ALERT_TIME = 5;

// Select DOM Elements
const cpuModel = document.getElementById('cpu-model');
const cpuProgress = document.getElementById('cpu-progress');
const cpuUsage = document.getElementById('cpu-usage');
const cpuFree = document.getElementById('cpu-free');
const ramUsage = document.getElementById('memory-usage');
const ramFree = document.getElementById('memory-free');
const ramProgress = document.getElementById('memory-progress');
const compName = document.getElementById('comp-name');
const compUser = document.getElementById('user');
const compOS = document.getElementById('os');
const compIP = document.getElementById('ip');
const memory = document.getElementById('mem-total');
const sysUptime = document.getElementById('sys-uptime');

// Run each seconds - Interval
setInterval(() => {
	// CPU Usage
	cpu.usage().then((cpuInfo) => {
		cpuUsage.innerText = `${cpuInfo.toFixed(2)} %`;

		// Progress bar percentage
		cpuProgress.style.width = cpuInfo + '%';

		// Progress bar overload color
		if (cpuInfo >= CPU_OVERLOAD_PERCENTAGE) {
			cpuProgress.style.background = 'red';

			// Check and Notify user
			if (runNotify(ALERT_TIME, 'CPU')) {
				notify({
					title: 'Warning: CPU Overload',
					body: `CPU usage is over ${CPU_OVERLOAD_PERCENTAGE}%. Please check your current process. If you're aware just ignore this warning.`,
					icon: path.join(__dirname, 'img', 'icon.png'),
				});

				// Set new timestamp for ALERT_TIME
				localStorage.setItem('howsys-CPU-lastNotify', +new Date());
			}
		} else {
			cpuProgress.style.background = '#fcba03';
		}
	});
	// CPU Free
	cpu.free().then((cpuInfo) => {
		cpuFree.innerText = `${cpuInfo.toFixed(2)} %`;
	});

	// RAM Usage
	mem.info().then((memInfo) => {
		// ramUsage.innerText = memInfo.usedMemMb + ' GB';
		ramUsage.innerText = `${memInfo.usedMemMb} GB - ${(
			100 - memInfo.freeMemPercentage
		).toFixed(2)} %`;
		ramFree.innerText = `${
			memInfo.freeMemMb
		} GB - ${memInfo.freeMemPercentage.toFixed(2)} %`;

		ramProgress.style.width = 100 - memInfo.freeMemPercentage + '%';

		// Progress bar overload color
		if (100 - memInfo.freeMemPercentage >= MEMORY_OVERLOAD_PERCENTAGE) {
			ramProgress.style.background = 'red';

			// Check and Notify user
			if (runNotify(ALERT_TIME, 'RAM')) {
				notify({
					title: 'Warning: RAM Overload',
					body: `RAM usage is over ${MEMORY_OVERLOAD_PERCENTAGE}%. Please check your current process. If you're aware just ignore this warning.`,
					icon: path.join(__dirname, 'img', 'icon.png'),
				});

				// Set new timestamp for ALERT_TIME
				localStorage.setItem('howsys-RAM-lastNotify', +new Date());
			}
		} else {
			ramProgress.style.background = '#fcba03';
		}
	});

	// Uptime
	sysUptime.innerText = formatDate(os.uptime());
}, 1500);

// Set cpu model
cpuModel.innerText = cpu.model();

// Computer Name
compName.innerText = os.hostname();

// Username
compUser.innerText = osCore.userInfo().username;

// OS
compOS.innerText = `${getOS(os.type())} ${osCore.release()} (${os.arch()})`; // 'Linux' on Linux, 'Darwin' on macOS, and 'Windows_NT' on Windows

// IP
compIP.innerText = os.ip();

// Total Memory
mem.info().then((info) => {
	memory.innerText = `${info.totalMemMb} GB`;
});

// OS Type Normalizer
function getOS(osType) {
	switch (osType) {
		case 'Windows_NT':
			return 'Windows';
		case 'Darwin':
			return 'macOS';
		case 'Linux':
			return 'Linux';
		default:
			return 'undefined';
	}
}

// Custom Date Format
//
function formatDate(time) {
	time = +time;
	const day = Math.floor(time / (3600 * 24));
	const hour = Math.floor((time % (3600 * 24)) / 3600);
	const mins = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60);

	return `${day}d, ${hour}h, ${mins}m, ${seconds}s`;
}

// Notification
function notify(options) {
	new Notification(options.title, options);
}

// Notification time checker
function runNotify(frequency, type) {
	let storageValue;
	switch (type) {
		case 'CPU':
			storageValue = localStorage.getItem('howsys-CPU-lastNotify');
			break;
		case 'RAM':
			storageValue = localStorage.getItem('howsys-RAM-lastNotify');
			break;
		default:
			storageValue = null;
			break;
	}

	if (!storageValue) {
		// Store timestamp
		localStorage.setItem(`howsys-${type}-lastNotify`, +new Date());
		// localStorage.setItem('howsys-CPU-lastNotify', +new Date());
		// localStorage.setItem('howsys-RAM-lastNotify', +new Date());
		return true;
	}
	const notifyTime = new Date(
		parseInt(localStorage.getItem(`howsys-${type}-lastNotify`))
	);

	const now = new Date();
	const diffTime = Math.abs(now - notifyTime);
	const minPassed = Math.ceil(diffTime / (1000 * 60));

	return minPassed > frequency ? true : false;
}
