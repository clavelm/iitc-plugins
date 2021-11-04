// @author         dw235
// @name           Apple Maps
// @category       Map Tiles
// @version        0.1.0
// @description    Add Apple Maps map layers


// use own namespace for plugin
var mapAppleMaps = {};
window.plugin.mapAppleMaps = mapAppleMaps;

mapAppleMaps.types = {
  map: {
    type: 'map'
  },
  satellite: {
    type: 'satellite'
  },
  hybrid: {
    type: 'hybrid'
  },
};

mapAppleMaps.options = {
  //set this to your API key
  apiParams: '<your API-key>'
};

function setup () {
  setupAppleMapsLeaflet();

  for (var name in mapAppleMaps.types) {
    var options = L.extend({}, mapAppleMaps.options, mapAppleMaps.types[name]);
    layerChooser.addBaseLayer(L.yandex(options), 'Yandex ' + name);
  }
};

function setupAppleMapsLeaflet () {

  try {
    // https://github.com/shramov/leaflet-plugins/blob/master/layer/tile/Yandex.js
    '@include_raw:external/Yandex.js@';

    '@include_raw:external/Yandex.addon.LoadApi.js@';
    
    } catch (e) {
      console.error('Yandex.js loading failed');
      throw e;
    }
}
