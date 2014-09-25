var CENTER = [43.771473, 11.253766];
var BOUNDARY = [
    [43.77501430276606, 11.23629575077682],
    [43.776648258532035, 11.237697781402051],
    [43.777800152366936, 11.23989999123833],
    [43.778306535445445, 11.241327111440906],
    [43.780155676985125, 11.247106387348605],
    [43.781837990346453, 11.246219708840469],
    [43.783390260483934, 11.247950119006813],
    [43.783417075782161, 11.250781336676987],
    [43.781458998673095, 11.251695543408642],
    [43.782980024445067, 11.258286785498116],
    [43.783690929367616, 11.261423494123807],
    [43.783510534860064, 11.262195476092385],
    [43.781967690162695, 11.263675812565259],
    [43.780215205703939, 11.265319100347298],
    [43.777988194575329, 11.267441242873655],
    [43.777865706259277, 11.267620481451328],
    [43.777925420124866, 11.26772780684767],
    [43.778006297026877, 11.267967267759905],
    [43.777988779709808, 11.268130774628752],
    [43.777860364251609, 11.268368888292702],
    [43.777553978030404, 11.268705337021435],
    [43.777362137564012, 11.268783447558125],
    [43.777200512774463, 11.268777334242648],
    [43.777068973853375, 11.26869355927284],
    [43.777004376999813, 11.26859261624795],
    [43.776959706644774, 11.268446460615325],
    [43.774139292084207, 11.271025673335439],
    [43.77076506175861, 11.270903999612772],
    [43.766390258669439, 11.26851384858784],
    [43.766049485774396, 11.268335771641985],
    [43.764781580395059, 11.267265806479985],
    [43.764674360003461, 11.267208941958796],
    [43.764853242793691, 11.264822525772288],
    [43.764171091044894, 11.264846294098344],
    [43.763864070064422, 11.262837677056734],
    [43.763988473299761, 11.262594801822495],
    [43.763313854248665, 11.260315812204587],
    [43.763090293288066, 11.258921042197642],
    [43.762964273510981, 11.25743092656613],
    [43.763275089111836, 11.25683196224241],
    [43.762967274908021, 11.254856394442671],
    [43.762895638321709, 11.254629590202224],
    [43.762721462647065, 11.254739211248518],
    [43.762597899926078, 11.254138594686573],
    [43.762187233274872, 11.253991854675331],
    [43.762351385061905, 11.253462654869878],
    [43.762310909231175, 11.253102542047264],
    [43.761344094176309, 11.250521579660957],
    [43.760498208594406, 11.244464872173667],
    [43.760711811251973, 11.242122942213413],
    [43.760901863313777, 11.241509438176196],
    [43.764736629519739, 11.241059124633743],
    [43.766648797666186, 11.240781122374546],
    [43.767972717292608, 11.239201285326018],
    [43.771823453981568, 11.240832915302127],
    [43.771903726970301, 11.240642018996198],
    [43.773407457457814, 11.241195930219261],
    [43.774845374917859, 11.236759997240334],
    [43.774986871244039, 11.236374174914609],
    [43.77501999956899, 11.236300638807029]
];

///////////////////// INSERIMENTO DELLA MAPPA /////////////////////
var map = L.map('map', {
    minZoom: 9,
    maxZoom: 22
});

// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
var tiles = L.tileLayer(
    'http://otile4.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    // 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
    {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 22, 
        maxNativeZoom: 19,  //resolve error retrieving tiles over zoom level 19
        reuseTiles: true
    }
)
tiles.addTo(map);


$(document).on('pagebeforeshow', '#home', function() {
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
    my_position.openPopup();  // try to resolve tile bug on start
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
