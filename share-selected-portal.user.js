// ==UserScript==
// @author         Mathieu CLAVEL
// @name           IITC plugin: Share selected portal
// @category       Controls
// @version        0.1.1
// @description    Add a share link when a portal is selected
// @id             share-selected-portal
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://github.com/clavelm/iitc-plugins/raw/dist/share-selected-portal.meta.js
// @downloadURL    https://github.com/clavelm/iitc-plugins/raw/dist/share-selected-portal.user.js
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
plugin_info.pluginId = 'share-selected-portal';
//END PLUGIN AUTHORS NOTE

// use own namespace for plugin
window.plugin.ssp = function() {};

window.plugin.ssp.shareLink = undefined;

// Append a share link in sidebar.
window.plugin.ssp.onPortalDetailsUpdated = function() {

  var portalGuid = window.selectedPortal;

  if(portalGuid == null) return;

  var data = window.portals[portalGuid].options.data;

  var lat = data.latE6 / 1E6;
  var lng = data.lngE6 / 1E6;
  var title = (data && data.title) || 'null';

  var posOnClick = window.showPortalPosLinks.bind(this, lat, lng, title);

  window.plugin.ssp.shareLink.off('click').on('click', posOnClick);

  // Prepend the share link to mobile status-bar
  $('#updatestatus').prepend(window.plugin.ssp.shareLink);

}

window.plugin.ssp.onPortalSelected = function() {
  window.plugin.ssp.shareLink.remove();
}

var setup = function() {

  if (typeof android !== 'undefined' && android && android.intentPosLink) {
    window.addHook('portalDetailsUpdated', window.plugin.ssp.onPortalDetailsUpdated);
    window.addHook('portalSelected', window.plugin.ssp.onPortalSelected);

    var span = $('<span>')
      .css('background-image', 'url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6c3ZnanM9Imh0dHA6Ly9zdmdqcy5jb20vc3ZnanMiIHZlcnNpb249IjEuMSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHg9IjAiIHk9IjAiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBjbGFzcz0iIj48Zz48cGF0aCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGQ9Im0zOTEgMzMyYy0yNC4xNSAwLTQ2LjEwNyA5LjU2NC02Mi4yODggMjUuMWwtOTYuMjU0LTU5LjYzM2M1LjQ5Mi0xMi43MjggOC41NDItMjYuNzQ3IDguNTQyLTQxLjQ2N3MtMy4wNS0yOC43MzktOC41NDMtNDEuNDY2bDk2LjI1NC01OS42MzNjMTYuMTgyIDE1LjUzNSAzOC4xMzkgMjUuMDk5IDYyLjI4OSAyNS4wOTkgNDkuNjI2IDAgOTAtNDAuMzc0IDkwLTkwcy00MC4zNzQtOTAtOTAtOTAtOTAgNDAuMzc0LTkwIDkwYzAgMTQuNjUxIDMuNTIxIDI4LjQ5NSA5Ljc1OCA0MC43MzJsLTk0LjAwMSA1OC4yMzhjLTE5LjI3Ni0yMy4xODQtNDguMzIxLTM3Ljk3LTgwLjc1Ny0zNy45Ny01Ny44OTcgMC0xMDUgNDcuMTAzLTEwNSAxMDVzNDcuMTAzIDEwNSAxMDUgMTA1YzMyLjQzNiAwIDYxLjQ4MS0xNC43ODYgODAuNzU3LTM3Ljk3bDk0LjAwMSA1OC4yMzhjLTYuMjM3IDEyLjIzNy05Ljc1OCAyNi4wODEtOS43NTggNDAuNzMyIDAgNDkuNjI2IDQwLjM3NCA5MCA5MCA5MHM5MC00MC4zNzQgOTAtOTAtNDAuMzc0LTkwLTkwLTkweiIgZmlsbD0iI2ZmZmZmZiIgZGF0YS1vcmlnaW5hbD0iIzAwMDAwMCIgc3R5bGU9IiIgY2xhc3M9IiIvPjwvZz48L3N2Zz4K")')
      .css('background-size', 'contain')
      .css('background-repeat', 'no-repeat')
      .css('display', 'inline-block')
      .css('float', 'left')
      .css('margin', '3px 1px 0 4px')
      .css('width', '32px')
      .css('height', '32px')
      .css('overflow', 'hidden');

    window.plugin.ssp.shareLink = $('<a>')
      .addClass('shareLink')
      .css('float', 'left')
      .css('margin', '-36px 0 0 -5px')
      .css('padding', '0 3px 1px 4px')
      .css('background', '#262c32')
      .append(span);
  }

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

