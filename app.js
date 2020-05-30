// const path = require('path');
// const os = require('os');
// const { ipcRenderer } = require('electron');

// Select DOM Contents
const cpuOverloadDOM = document.getElementById('cpu-overload');
const ramOverloadDOM = document.getElementById('ram-overload');
const alertFrequencyDOM = document.getElementById('alert-frequency');
const settingsForm = document.getElementById('settings-form');
const alert = document.getElementById('alert');

// Get default & custom settings
ipcRenderer.on('settings:get', (e, settings) => {
	cpuOverloadDOM.value = settings.cpuOverload;
	ramOverloadDOM.value = settings.ramOverload;
	alertFrequencyDOM.value = settings.alertFrequency;
});

// Submit settings
settingsForm.addEventListener('submit', (e) => {
	e.preventDefault();

	const cpuOverload = cpuOverloadDOM.value;
	const ramOverload = ramOverloadDOM.value;
	const alertFrequency = alertFrequencyDOM.value;

	// Send new settings to main process
	ipcRenderer.send('settings:set', {
		cpuOverload,
		ramOverload,
		alertFrequency,
	});

	showAlert('Settings saved successfully.');
});

function showAlert(message) {
	alert.classList.remove('hide');
	alert.classList.add('alert');
	alert.innerText = message;

	setTimeout(() => {
		alert.classList.add('hide');
	}, 3000);
}
