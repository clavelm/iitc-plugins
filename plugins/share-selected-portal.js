// @author         Mathieu CLAVEL
// @name           Share selected portal
// @category       Controls
// @version        0.2.0
// @description    Add a share link when a portal is selected

// use own namespace for plugin
const SSP = {

  // JQuery<HTML Element> that will hold the share link to the selected portal
  // Property defined in setup()
  // shareLink

  // Append a share link in sidebar.
  onPortalUpdate: () => {

    const portalGuid = window.selectedPortal;

    if (portalGuid == null) return;

    const data = window.portals[portalGuid].options.data;

    const lat = data.latE6 / 1E6;
    const lng = data.lngE6 / 1E6;
    const title = (data && data.title) || 'null';

    const posOnClick = window.showPortalPosLinks.bind(this, lat, lng, title);

    this.shareLink.off('click').on('click', posOnClick);

    // Prepend the share link to mobile status-bar
    $('#updatestatus').prepend(this.shareLink);

  },

  onPortalSelected: () => {
    this.shareLink.remove();
  },
};
window.plugin.ssp = SSP;

// setup function for iitc
// defined using the var keyword to have a scope outside this file
var setup = () =>  {
  const ANDROID = L.Browser.android;

  if (typeof ANDROID !== 'undefined' && ANDROID) {
    $('<style>')
        .prop('type', 'text/css')
        .html('@include_css:share-selected-portal.css@')
        .appendTo('head');

    window.addHook('portalDetailsUpdated', SSP.onPortalUpdate);
    window.addHook('portalSelected', SSP.onPortalSelected);

    // JQuery<HTML Element> that will hold the share link to the selected portal
    SSP.shareLink = $('<a>')
        .addClass('shareLink')
        .append('<span>');
  }
};