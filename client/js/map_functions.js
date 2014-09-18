var CENTER = [43.771473, 11.253766];
var BOUNDARY = [
    [43.763007, 11.267304],[43.77225, 11.29374],[43.78755, 11.25015],
    [43.77846, 11.23801],[43.76484, 11.24234], [43.763007, 11.267304]
];

///////////////////// INSERIMENTO DELLA MAPPA /////////////////////
var map = L.map('map')

// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
var tiles = L.tileLayer(
    'http://otile4.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    // 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
    {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 30,
        reuseTiles: true
    }
)
tiles.addTo(map);


$(document).on('pageshow', '#home', function() {
    /**
     * this is needed due to a known bug which causes the map to disappear
     */
    tiles.redraw();
});


/////////////////////////// DA LONTANO ///////////////////////////
var introduction = "area degli scavi archeologici di firenze"

var big_line = L.polyline(
    BOUNDARY,
    {color: 'red'}
).bindPopup(introduction);

var cluster = L.polygon(
    BOUNDARY,
    {color: 'red'}
).bindPopup(introduction);
cluster.on("click", function() {
    map.setView(CENTER, 16);
});
cluster.on('mouseover', function (e) {
    this.openPopup();
});
cluster.on('mouseout', function (e) {
    this.closePopup();
});

var RedIcon = L.Icon.Default.extend(
    {
        options: {iconUrl: 'images/marker_icon_red.png'}
    }
);
var redIcon = new RedIcon();
var far_marker = L.marker(
    CENTER,
    {icon: redIcon}
).bindPopup(introduction);
far_marker.on("click", function() {
    map.setView(CENTER, 16);
});
far_marker.on('mouseover', function (e) {
    this.openPopup();
});
far_marker.on('mouseout', function (e) {
    this.closePopup();
});


function onZoomend() {
    var zoom_now = map.getZoom();
    console.log("zoom: ", zoom_now);

    if(zoom_now >= 17) {
        map.removeLayer(big_line);
        map.removeLayer(far_marker);
        map.removeLayer(cluster);
    }
    else if((zoom_now < 17) && (zoom_now >= 14)) {
        big_line.addTo(map);
        map.removeLayer(far_marker);
        map.removeLayer(cluster);
    }
    else if((zoom_now < 13) && (zoom_now >= 10)) {
        map.removeLayer(big_line);
        map.removeLayer(far_marker);
        cluster.addTo(map);
    }
    else if(zoom_now < 10) {
        map.removeLayer(big_line);
        far_marker.addTo(map);
        map.removeLayer(cluster);
    }
};
map.on('zoomend', onZoomend);


///////////////////// LOCALIZZAZIONE INIZIALE /////////////////////
map.locate({setView: true, maxZoom: 16});

function onLocationFound(e) {
    var my_position = L.marker(e.latlng)
    // var my_position = L.marker([46.019853,5.74585]);     testing
    my_position.bindPopup("sei qui");
    my_position.addTo(map);
    var to_be_shown = new L.featureGroup([my_position, far_marker, cluster, big_line]);
    map.fitBounds(to_be_shown.getBounds());
    console.log(e);
}
map.on('locationfound', onLocationFound);

function onLocationError(e) {
    map.setView(CENTER, 18);
    console.log(e.message);
}
map.on('locationerror', onLocationError);



//////////// INSERIMENTO LAYER WMS SCAVI ARCHEOLOGICI ////////////
var layer_interventi = L.tileLayer.wms(
    'http://www.opengeo.eu:8080/geoserver/wms?',
    {
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
    'http://www.opengeo.eu:8080/geoserver/wms?',
    {
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
    'http://www.opengeo.eu:8080/geoserver/wms?',
    {
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
