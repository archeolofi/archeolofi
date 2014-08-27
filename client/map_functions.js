///////////////////// INSERIMENTO DELLA MAPPA /////////////////////
var map = L.map('map')

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; \
        <a href="http://openstreetmap.org"> \
            OpenStreetMap \
        </a> \
        contributors, \
        <a href="http://creativecommons.org/licenses/by-sa/2.0/"> \
            CC-BY-SA \
        </a>, \
        Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 25
}).addTo(map);

map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.circle(e.latlng, radius).addTo(map).bindPopup(
        "You are within " + radius + " meters from this point"
    ).openPopup();
    console.log(e);
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}
map.on('locationerror', onLocationError);


//////////// INSERIMENTO LAYER WMS SCAVI ARCHEOLOGICI ////////////
var datilayer1 = L.tileLayer.wms(
    'http://datigis.comune.fi.it/geoserver/wms?', {
        layers: 'archeologia:scavi_archeo',
        format: 'image/png',
        transparent: true,
        attribution: ""
    }
);
datilayer1.addTo(map);


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
