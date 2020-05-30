// const path = require('path');
// const os = require('os');
const { ipcRenderer } = require('electron');

// Select DOM Contents
const cpuOverload = document.getElementById('cpu-overload');
const alertFrequency = document.getElementById('alert-frequency');

ipcRenderer.on('settings:get', (e, settings) => {
	cpuOverload.value = settings.cpuOverload;
	alertFrequency.value = settings.alertFrequency;
});
