// ==UserScript==
// @author         Mathieu CLAVEL
// @name           IITC plugin: Share selected portal
// @category       Controls
// @version        0.2.0
// @description    Add a share link when a portal is selected
// @id             share-selected-portal
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://github.com/clavelm/iitc-plugin-share-selected-portal/releases/latest/download/share-selected-portal.meta.js
// @downloadURL    https://github.com/clavelm/iitc-plugin-share-selected-portal/releases/latest/download/share-selected-portal.user.js
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'dw235';
plugin_info.dateTimeVersion = '2021-12-13-221522';
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
    $('<style>').prop('type', 'text/css').html('\
a.shareLink {\
    float: left;\
    margin: -36px 0 0 -5px;\
    padding: 0 3px 1px 4px;\
    background: #262c32;\
}\
\
a.shareLink span {\
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB4PSIwIiB5PSIwIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgY2xhc3M9IiI+PGc+PHBhdGggeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkPSJtMzkxIDMzMmMtMjQuMTUgMC00Ni4xMDcgOS41NjQtNjIuMjg4IDI1LjFsLTk2LjI1NC01OS42MzNjNS40OTItMTIuNzI4IDguNTQyLTI2Ljc0NyA4LjU0Mi00MS40NjdzLTMuMDUtMjguNzM5LTguNTQzLTQxLjQ2Nmw5Ni4yNTQtNTkuNjMzYzE2LjE4MiAxNS41MzUgMzguMTM5IDI1LjA5OSA2Mi4yODkgMjUuMDk5IDQ5LjYyNiAwIDkwLTQwLjM3NCA5MC05MHMtNDAuMzc0LTkwLTkwLTkwLTkwIDQwLjM3NC05MCA5MGMwIDE0LjY1MSAzLjUyMSAyOC40OTUgOS43NTggNDAuNzMybC05NC4wMDEgNTguMjM4Yy0xOS4yNzYtMjMuMTg0LTQ4LjMyMS0zNy45Ny04MC43NTctMzcuOTctNTcuODk3IDAtMTA1IDQ3LjEwMy0xMDUgMTA1czQ3LjEwMyAxMDUgMTA1IDEwNWMzMi40MzYgMCA2MS40ODEtMTQuNzg2IDgwLjc1Ny0zNy45N2w5NC4wMDEgNTguMjM4Yy02LjIzNyAxMi4yMzctOS43NTggMjYuMDgxLTkuNzU4IDQwLjczMiAwIDQ5LjYyNiA0MC4zNzQgOTAgOTAgOTBzOTAtNDAuMzc0IDkwLTkwLTQwLjM3NC05MC05MC05MHoiIGZpbGw9IiNmZmZmZmYiIGRhdGEtb3JpZ2luYWw9IiMwMDAwMDAiIHN0eWxlPSIiIGNsYXNzPSIiLz48L2c+PC9zdmc+DQo=);\
    background-size: contain;\
    background-repeat: no-repeat;\
    display: inline-block;\
    float: left;\
    margin: 3px 1px 0 4px;\
    width: 32px;\
    height: 32px;\
    overflow: hidden;\
}\
').appendTo('head');

    window.addHook('portalDetailsUpdated', window.plugin.ssp.onPortalDetailsUpdated);
    window.addHook('portalSelected', window.plugin.ssp.onPortalSelected);

    window.plugin.ssp.shareLink = $('<a>')
      .addClass('shareLink')
      .append('<span>');
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

