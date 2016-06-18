var map;
var geocoder;
var initialAddressLatLong = {lat: 30.267, lng: -97.744};
var address1;
var address2;
var addres1LatLng;
var addres2LatLng;

function initialize() {
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: initialAddressLatLong
    });

    document.getElementById('address1-submit').addEventListener('click', function () {
        address1 = document.getElementById('address1').value;
        address2 = document.getElementById('address2').value;

        console.log(address1, address2);

        // geocodeAddress(address1);
        getLatLongFromAddress(address1, address2);
        console.log(addres1LatLng, addres2LatLng);
        calculateMidPoint(address1, address2);
    });
}

function plotMidPoint(address) {
    // var address = document.getElementById('address1').value;
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

function getLatLongFromAddress(address1, address2) {
    geocoder.geocode({'address': address1}, function (results) {
        addres1LatLng = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
        console.log(addres1LatLng);
    });

    geocoder.geocode({'address': address2}, function (results) {
        addres2LatLng = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
        console.log(addres2LatLng);
    });
}

function calculateMidPoint (address1, address2) {
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}