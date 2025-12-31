const { ipcRenderer } = require('electron');

window.fs = require('fs')
window.path = require('path')
window.ipcRenderer = require('electron').ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
  //console.log('Preload loaded!');
});
