// ==UserScript==
// @author         https://github.com/balthild
// @name           IITC plugin: Force refresh
// @category       Tweaks
// @version        0.2.5
// @description    Reload intel data without refreshing the page.
// @id             force-refresh
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://github.com/clavelm/iitc-plugins/raw/dist/force-refresh.meta.js
// @downloadURL    https://github.com/clavelm/iitc-plugins/raw/dist/force-refresh.user.js
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'dw235';
plugin_info.dateTimeVersion = '2021-10-08-170506';
plugin_info.pluginId = 'force-refresh';
//END PLUGIN AUTHORS NOTE

window.plugin.forceRefresh = function() {};

window.plugin.forceRefresh.onRefreshClick = function() {
  window.idleReset();
  window.mapDataRequest.cache = new DataCache();
  window.mapDataRequest.refresh();
  window.mapDataRequest.processRequestQueue();
}

var setup = function() {
  var container = L.DomUtil.create('div', 'leaflet-control');
  var toolbar = L.DomUtil.create('div', 'leaflet-bar');
  var button = L.DomUtil.create('a', 'leaflet-refresh');

  $(button).text("↻").on('click', window.plugin.forceRefresh.onRefreshClick)
           .appendTo(toolbar)
           .parent().appendTo(container)
           .parent().appendTo('.leaflet-top.leaflet-left');
};

setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

