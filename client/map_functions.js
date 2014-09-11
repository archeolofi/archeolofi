///////////////////// INSERIMENTO DELLA MAPPA /////////////////////
var map = L.map('map')

// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
L.tileLayer(
    'http://otile4.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    // 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
    {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 30
    }
).addTo(map);


map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map);
    console.log(e);
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    map.setView([43.771473, 11.253766], 18);
    console.log(e.message);
}
map.on('locationerror', onLocationError);

var polyline = L.polyline([ [43.763007, 11.267304 ],[43.77225, 11.29374],[43.78755, 11.25015],[43.77846, 11.23801],[43.76484, 11.24234], [43.763007, 11.267304 ]], {color: 'red'}).addTo(map);

var RedIcon = L.Icon.Default.extend({
            options: {
            	    iconUrl: 'images\marker_icon_red.png' 
            }
});
var redIcon = new RedIcon();

L.marker([43.77153,11.25441], {icon: redIcon}).addTo(map);



//////////// INSERIMENTO LAYER WMS SCAVI ARCHEOLOGICI ////////////
var layer_interventi = L.tileLayer.wms(
    'http://www.opengeo.eu:8080/geoserver/wms?', {
        layers: 'topp:interventi',
        format: 'image/png',
        transparent: true,
        attribution: "",
        maxZoom: '25',
        minZoom: '7'
    }
);
//////////// INSERIMENTO LAYER WMS SCAVI ARCHEOLOGICI ////////////
var layer_ritrovamenti_linee = L.tileLayer.wms(
    'http://www.opengeo.eu:8080/geoserver/wms?', {
        layers: 'topp:view_ritro_line',
        format: 'image/png',
        transparent: true,
        attribution: "",
        maxZoom: '25',
        minZoom: '19'
    }
);
//////////// INSERIMENTO LAYER WMS SCAVI ARCHEOLOGICI ////////////
var layer_ritrovamenti_punti = L.tileLayer.wms(
    'http://www.opengeo.eu:8080/geoserver/wms?', {
        layers: 'topp:view_ritro_punti',
        format: 'image/png',
        transparent: true,
        attribution: "",
        maxZoom: '25',
        minZoom: '19'
    }
);


layer_interventi.addTo(map);
layer_ritrovamenti_linee.addTo(map);
layer_ritrovamenti_punti.addTo(map);


/////// GESTIONE POPUP INFORMAZIONI TRAMITE CLICK SU MAPPA ///////
map.addEventListener('click', onMapClick);
popup = new L.Popup({ width: 50 });

function onMapClick(e) {
    // coordinate server ( long, lat ) coordinate standard ( lat, long)
    var bbox = map.getBounds()._southWest.lat + ","
            + map.getBounds()._southWest.lng + ","
            + map.getBounds()._northEast.lat + ","
            + map.getBounds()._northEast.lng;

    var width = map.getSize().x;
    var height = map.getSize().y;
    var x = map.layerPointToContainerPoint(e.layerPoint).x;
    var y = map.layerPointToContainerPoint(e.layerPoint).y;
    wms_proxy(bbox, width, height, x, y, e);
};
