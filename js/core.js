var geocoder;
var map;
var resultados;
var markers = Array();
var infos = Array();
var callback;
var myLatlng;
var x = -3.8119963;
var y = -38.4894433;

function initialize_map(){
    setupLocalStorage()
    x = parseFloat(getParameterByName('x')); y = parseFloat(getParameterByName('y'));
    d_x = parseFloat(getParameterByName('d_x')); d_y = parseFloat(getParameterByName('d_y'));
    var icon = getParameterByName('icon');
    var nome = getParameterByName('name');
    var vicinity = getParameterByName('vicinity');

    var infoHeader =  '<font style="color:#000;"><h3>' + nome + 
        '</h3><br />Endereço: ' + vicinity + '</font>';
    $('#infoHeader').html(infoHeader);

    geocoder = new google.maps.Geocoder();
    var type_list = getParameterByName('categoria').split(',');

    // set initial position (New York) var loc = new google.maps.LatLng(-3.8119963, -38.4894433,17);
    myLatlng = new google.maps.LatLng(x, y);

    var myOptions = { // default map options
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);

    var directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    var request = {
        origin: myLatlng,
        destination: new google.maps.LatLng(d_x, d_y),
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
        }
    });
    
}


function initialize() {
    // prepare Geocoder
    setupLocalStorage()
    geocoder = new google.maps.Geocoder();
    var type_list = getParameterByName('categoria').split(',');

    // set initial position (New York) var loc = new google.maps.LatLng(-3.8119963, -38.4894433,17);
    myLatlng = new google.maps.LatLng(x, y);

    var myOptions = { // default map options
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);

    // prepare request to Places
    var request = {
        location: myLatlng,
        radius: 1500,
        types: type_list
    };

    // send request
    iconFile = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; 
	var mark = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: "Onde Estou"
    });
    mark.setIcon(iconFile);
	

    service = new google.maps.places.PlacesService(map);
    service.search(request, callback);
}

// clear overlays function
function clearOverlays() {
    if (markers) {
        for (i in markers) {
            markers[i].setMap(null);
        }
        markers = [];
        infos = [];
    }
}

// clear infos function
function clearInfos() {
    if (infos) {
        for (i in infos) {
            if (infos[i].getMap()) {
                infos[i].close();
            }
        }
    }
}

// find address function
function findAddress() {
    var address = document.getElementById("gmap_where").value;

    // script uses our 'geocoder' in order to find location by address name
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) { // and, if everything is ok

            // we will center map
            var addrLocation = results[0].geometry.location;
            map.setCenter(addrLocation);

            // store current coordinates into hidden variables
            document.getElementById('lat').value = results[0].geometry.location.$a;
            document.getElementById('lng').value = results[0].geometry.location.ab;

            // and then - add new custom marker
            var addrMarker = new google.maps.Marker({
                position: addrLocation,
                map: map,
                title: results[0].formatted_address,
                icon: 'marker.png'
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// find custom places function
function findPlaces() {

    // prepare variables (filter)
    var type = document.getElementById('gmap_type').value;
    var radius = document.getElementById('gmap_radius').value;
    var keyword = document.getElementById('gmap_keyword').value;

    var lat = document.getElementById('lat').value;
    var lng = document.getElementById('lng').value;
    var cur_location = new google.maps.LatLng(lat, lng);

    // prepare request to Places
    var request = {
        location: cur_location,
        radius: radius,
        types: ['food']
    };

    if (keyword) {
        request.keyword = [keyword];
    }

    // send request
    service = new google.maps.places.PlacesService(map);
    service.search(request, createMarkers);
}

// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
    x = getParameterByName('x'); y = getParameterByName('y');
    d_x = getParameterByName('d_x'); d_y = getParameterByName('d_y');


    if (status == google.maps.places.PlacesServiceStatus.OK) {

        // if we have found something - clear map (overlays)
        clearOverlays();

        // and create new markers by search result
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert('Sorry, nothing is found');
    }
}

// creare single marker function
function createMarker(obj) {

    // prepare new Marker object
    var mark = new google.maps.Marker({
        position: obj.geometry.location,
        map: map,
        title: obj.name
    });
    markers.push(mark);

    // prepare info window
    var infowindow = new google.maps.InfoWindow({
        content: '<img src="' + obj.icon + '" /><font style="color:#000;">' + obj.name + 
        '<br />Rating: ' + obj.rating + '<br />Vicinity: ' + obj.vicinity + '</font>'
    });

    // add event handler to current marker
    google.maps.event.addListener(mark, 'click', function() {
        clearInfos();
        infowindow.open(map,mark);
    });
    infos.push(infowindow);
}

function listar_lugares(result, status){
    $('#carregando').hide();
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        $.each(result, function(index, place){
            var link = $('<a/>'); link.addClass('list-group-item'); 
            localStorage.setItem('back', localStorage.getItem('query_string'));
            console.log("Coordenadas: " +  place.geometry.location.D + ", " +  place.geometry.location.k);
            console.log(place.geometry.location);
            link.attr('href','javascript:go_to("mapa.html","x=' + x + '&y=' + y + '&d_x=' + place.geometry.location.lat() + 
                      '&d_y=' + place.geometry.location.lng() + '&name=' + place.name + '&vicinity=' + place.vicinity +
                      '&icon=' + place.icon + '")');
            
            var h4 = $('<h4/>').text(place.name);
            var p = $('<p/>').text(place.vicinity);
            link.append(h4);
            link.append(p);
            link.append(rating(place.rating));
            var service = new google.maps.DistanceMatrixService();
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
              {
                origins: [myLatlng],
                destinations: [place.geometry.location],
                travelMode: google.maps.TravelMode.DRIVING,
                avoidHighways: false,
                avoidTolls: false
              }, function(response, status){
                if (status == google.maps.DistanceMatrixStatus.OK) {
                    var origins = response.originAddresses;
                    var destinations = response.destinationAddresses;

                    for (var i = 0; i < origins.length; i++) {
                      var results = response.rows[i].elements;
                      for (var j = 0; j < results.length; j++) {
                        var element = results[j];
                        var distance = element.distance.text;
                        var duration = element.duration.text;
                        var from = origins[i];
                        var to = destinations[j];
                        link.append($('<p/>').text('Distância: ' + distance));
                        break;
                      }
                      break;
                    }
                  }

                $('#lista').append(link);
              });
        });
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        $('#warn').text('Sem resultados para o seu local.');
    }
}

function rating(nota){
    var p = $('<p/>'); p.text('Avaliação: ');
    if(nota == null || nota == undefined){
        p.append("Indisponível");
        return p;
    }

    for(var i =0; i < nota; i++){
        var star = $('<span/>'); star.addClass('glyphicon glyphicon-star');
        p.append(star);
    }
    return p;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp(name + "=([^&#]*)"),
        results = regex.exec(localStorage.getItem('query_string'));
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function setupLocalStorage(){
    var raio = localStorage.getItem('raio');
    if(!raio)
        localStorage.setItem('raio', 1000);
}

function carregarModal(){

}

function salvarConfiguracoes(){
    var raio = $('#')
}

function go_to(link, query_string){
    if(query_string){
        localStorage.setItem('query_string', query_string);
    }

    location.href = link; 
}



// initialization
