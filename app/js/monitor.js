const path = require('path');
const osCore = require('os');
const osu = require('node-os-utils');

const os = osu.os;
const cpu = osu.cpu;
const mem = osu.mem;

let CPU_OVERLOAD_PERCENTAGE = 80;
let MEMORY_OVERLOAD_PERCENTAGE = 75;

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
		if (cpuInfo > CPU_OVERLOAD_PERCENTAGE) {
			cpuProgress.style.background = 'red';
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
		if (100 - memInfo.freeMemPercentage > MEMORY_OVERLOAD_PERCENTAGE) {
			ramProgress.style.background = 'red';
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
