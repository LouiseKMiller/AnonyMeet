var map;
var geocoder;
var initialAddressLatLong = {lat: 30.267, lng: -97.744};
var address1;
var address2;
var address1LatLng;
var address2LatLng;

var latLngPersonA;
var latLngPersonB;

//adding firebase to appMeet.js
var fbPeople = new Firebase("https://anonymeetut.firebaseio.com/people");

var fbPersonA = fbPeople.child('/personA');
var fbPersonB = fbPeople.child('/personB');

var personAAddress;
var personBAddress;

// location for midpoint in lat lng
var midpoint;

function initialize() {
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: initialAddressLatLong
    });

    document.getElementById('address1-submit').addEventListener('click', function () {
        address1 = document.getElementById('address1').value;
        address2 = document.getElementById('address2').value;

        getAddresFirebase(fbPersonA)
            .then(function (addressA) {
                console.log(addressA);
                personAAddress = addressA;
                return getAddresFirebase(fbPersonB)
            })
            .then(function (addressB) {
                console.log(addressB);
                personBAddress = addressB;
            })
            .catch(function (error) {
                console.log(error);
            });

        getLatlngFromAddress(address1)
            .then(function (latlng) {
                address1LatLng = latlng;
                return getLatlngFromAddress(address2);
            })
            .then(function (latlng) {
                address2LatLng = latlng;
                // return 'finally';
            })
            .then(function (status) {
                return calculateMidPoint(address1LatLng, address2LatLng);
            })
            .then(function (midPoint) {
                // console.log(midPoint, 'midpoint')
                midpoint = midPoint;
            })
            .catch(function (result) {
                console.log(result);
            });
    });
}

function getAddresFirebase(url) {
    return new Promise(function(resolve, reject) {
        url.on("value", function (snapshot) {
            // console.log(snapshot.val(), 'gAGGA');
            if (snapshot != null) {
                // console.log(snapshot.val(), 'gAGGA');
                var streetNumber = snapshot.val().streetNumber;
                var street = snapshot.val().street;
                var city = snapshot.val().city;
                var state = 'TX';
                var zip = snapshot.val().zip;

                var completeAddress = streetNumber + ' ' + street + ' ' + city + ', ' + state + ' ' + zip;
                // console.log(completeAddress);

                resolve(completeAddress);
            } else {
                reject('ERRORERROR EROEROER');
            }
        });
    });
}

function getLatlngFromAddress(address) {
    return new Promise(function(resolve, reject) {
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // console.log(results[0].geometry.location);
                resolve(results[0].geometry.location);
            } else {
                reject(status);
            }
        });
    });
}

function calculateMidPoint (a1, a2) {
    return google.maps.geometry.spherical.interpolate(a1, a2, .5);
}