// @author         dw235
// @name           Apple Maps
// @category       Map Tiles
// @version        0.1.0
// @description    Add Apple Maps map layers


// use own namespace for plugin
var mapAppleMaps = {};
window.plugin.mapAppleMaps = mapAppleMaps;

mapAppleMaps.types = {
  default: {
    type: 'default'
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
    layerChooser.addBaseLayer(L.apple(options), 'Apple Maps ' + name);
  }
};

function setupAppleMapsLeaflet () {

  try {
    // https://unpkg.com/leaflet.mapkitmutant@latest/Leaflet.MapkitMutant.js
    '@include_raw:external/Leaflet.MapkitMutant.js@';
    
    } catch (e) {
      console.error('Leaflet.MapkitMutant.js loading failed');
      throw e;
    }
}
