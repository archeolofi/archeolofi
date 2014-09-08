///////////////////// INSERIMENTO DELLA MAPPA /////////////////////
var map = L.map('map')

// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
L.tileLayer(
    // 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
    {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 30
    }
).addTo(map);

map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.circle(e.latlng, radius).addTo(map).bindPopup(
        "Sei a circa " + radius + " metri da questo punto"
    ).openPopup();
    console.log(e);
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    map.setView([43.771473, 11.253766], 18);
    console.log(e.message);
}
map.on('locationerror', onLocationError);


//////////// INSERIMENTO LAYER WMS SCAVI ARCHEOLOGICI ////////////
var layer_interventi = L.tileLayer.wms(
    'http://www.opengeo.eu:8080/geoserver/wms?', {
        layers: 'topp:interventi',
        format: 'image/png',
        transparent: true,
        attribution: "",
        maxZoom: '25',
        minZoom: '15'
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
