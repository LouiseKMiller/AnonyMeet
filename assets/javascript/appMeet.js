
// AnonyMeet 

//*****************************************************
//  MAP RELATED MODULES
//******************************************************

// cannot have initMap wait for document ready since
// google map API call is asynchronous

var map;
var geoccoder;

var spots = [];
var locations = [];
	
// locations for personA and personB in lat lng
// placeholder for results from Geocoding module
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
var request;


// in case we want to style the map
// 

var styles = [
	{featureType: 'water',
	  	stylers: [
	  	{color: '#000000'}
		]},
	{featureType: 'administrative',
	  	elementType: 'labels.text.stroke',
		stylers: [
		{color: '#ffffff'},
		{weight: 8}
		]},
	{featureType: 'transit.station',
		stylers: [
		{hue: '#e85113'},
		{weight: 9}
		]}
	];

// Constructor creates a new map - only center and zoom are required.
// NOTE:  WE SHOULD CENTER MAP ON MIDPOINT BETWEEN PERSON A AND PERSON B
function initMap() {
    geocoder = new google.maps.Geocoder();

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 18,
		styles: styles,
		mapTypeControl: false
		});
	}

$(document).ready(function(){

// *********************************************
//  PLACEHOLDER FOR GEOCODING MODULE
//
// get lat lng of personA and personB addresses
// store results in vars latLngPersonA and latLngPersonB
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

    getAddresFirebase(fbPersonA)
        .then(function (addressA) {
            // console.log(addressA);
            personAAddress = addressA;
            return getAddresFirebase(fbPersonB)
        })
        .then(function (addressB) {
            // console.log(addressB);
            personBAddress = addressB;
        })
        .then(function (getLatlngs) {
            return getLatlngFromAddress(personAAddress);
        })
        .then(function (latlngA) {
            latLngPersonA = latlngA;
            return getLatlngFromAddress(personBAddress);
        })
        .then(function (latlngB) {
            latLngPersonB = latlngB;
            // return 'finally';
        })
        .then(function (status) {
            return calculateMidPoint(latLngPersonA, latLngPersonB);
        })
        .then(function (midPoint) {
            midpoint = midPoint;
            doEverythingElse();
        })
        .catch(function (result) {
            console.log(result);
        });

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

// latLngPersonA =	{lat: 30.2600, lng: -97.7400};
// latLngPersonB = {lat: 30.5555, lng: -97.8888};
// getLatlngFromAddress(address1)
//     .then(function (latlng) {
//         address1LatLng = latlng;
//         return getLatlngFromAddress(address2);
//     })
//     .then(function (latlng) {
//         address2LatLng = latlng;
//         // return 'finally';
//     })
//     .then(function (status) {
//         return calculateMidPoint(address1LatLng, address2LatLng);
//     })
//     .then(function (midPoint) {
//         // console.log(midPoint, 'midpoint')
//         midpoint = midPoint;
//     })
//     .catch(function (result) {
//         console.log(result);
//     });


// **********************************************
// PLACEHOLDER FOR CALCULATION OF MIDPOINT BETWEEN PERSON A AND PERONS B 
//- midpoint used in places service call below

function calculateMidPoint (a1, a2) {
    return google.maps.geometry.spherical.interpolate(a1, a2, .5);
}

// midpoint = new google.maps.LatLng(30.2600, -97.7400);



function doEverythingElse() {

//*************************************************
// PLACES SERVICE - GET NEARBY PLACES
// using Google Maps Places service with Nearby Search Request
// Can specify type of places and radius (in meters) from specified location
// Specified location should be midpoint between personA and personB
// You get a result of 20 places
// Result stored in local 'spots' object
// ** will need to store in firebase as well ??
// 
//  uses var midpoint calculated from module above

    var serviceP = new google.maps.places.PlacesService(map);

var request = {
	location: midpoint,
	radius: '1200',
	types: ['restaurant']
	};

// this is the pop-up window that appears when you
// click on a marker
    var largeInfowindow = new google.maps.InfoWindow();
    var marker;
//style the markers.  we use highlightedIcon
//when user hovers over the marker
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

// FUNCTIONS USED IN PLACES CALLBACK FUNCTION 'FINDPLACES'
// 1. makeMarkerIcon - stylize markers
// 2. createMarker - marker created for each place
// 3. populateInfoWindow - add place name to infoWindow

// function for stylizing the markers.  Not sure I understand
// the call yet.  Need to look into this further.
//
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_spin&chld=1.15|0|" + markerColor + "|40|_|%E2%80%A2",
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    };

    function createMarker(place) {

        //create marker per location and place on map
        marker = new google.maps.Marker({
            map: map, // this places the marker on the map
            position: place.geometry.location,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            //		id: i
        });

        // create an onclick event to open an infowindow at each marker
        marker.addListener('click', function () {

            populateInfoWindow(this, largeInfowindow, place.name);
        });

        marker.addListener("mouseover", function () {
            this.setIcon(highlightedIcon);
        });

        marker.addListener("mouseout", function () {
            this.setIcon(defaultIcon);
        });
    };


// *************** NEED TO STYLE INFO WINDOWS BETTER
    function populateInfoWindow(marker, infowindow, placeName) {
        // check to make sure the infowindow is not already opened in this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent(placeName);
            infowindow.open(map, marker);
            // make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.setMarker(null);
            });
        }
    };

// callback function for Places API call


    function findPlaces(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {

            // for each place found, store results in 'spots' object
            // and create a marker and place marker on the map
            // NOTE:  20 is probably too many.
            //  Maybe we should limit it to the top 5??
            //  Then create markers for just those top 5 ???
            //  Need to figure out how to match up the top 5 for
            //  each user (personA and personB)

            // create LatLngBounds instance that capture SW and NE corners of viewport
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < results.length; i++) {
                var place = results[i];
                // we suse the spots object to save the information
                // used for the html table
                spots.push({
                    name: place.name,
                    position: place.geometry.location,
                    address: place.vicinity
                });
                // Have to create a separate array with just
                // the locations for use in the distance matrix
                // *** HECTOR - I'm hoping that there is one to one correspondence between the spots object and the locations array.  Is there a better way of doing this?  Some sort of array mapping?
                locations.push(place.geometry.location);
                createMarker(results[i]);
                // extend boundaries of map for each marker
                bounds.extend(place.geometry.location);
            }
            map.fitBounds(bounds);

        }
        else console.log(status);

        //  now that you have the places stored in the 'spots' object,
        //  find the distance from each spot to personA
        //  Once we use Firebase, we can change personA to User
        //  ** NOTE FOR HECTOR - I can't figure out how to save the 'locations'
        //  object data	in a way that I can access it oustide of the PLACES
        //  callback function.  What am I doing wrong?  Or is that just
        //  the way Google Map APIs work?

        doDistanceMatrix();
    };

// API call through Google Places JavaScript Library
//     console.log(request, 'request');
    serviceP.nearbySearch(request, findPlaces);

//*****************************************************
//CODE FOR DISTANCE MATRIX SERVICE
// get distance matrix information for yourLocation versus 
// all places returned from Places API call
    //  other person will do the same thing, and then
    // save the data to Firebase

    var serviceD = new google.maps.DistanceMatrixService();


    function doDistanceMatrix() {


        serviceD.getDistanceMatrix(
            {
                origins: [latLngPersonA],
                destinations: locations,
                travelMode: google.maps.TravelMode.DRIVING,
                // transitOptions: TransitOptions,
                // drivingOptions: DrivingOptions,
                // unitSystem: UnitSystem,
                avoidHighways: false,
                avoidTolls: false,
            }, calcMatrix);

        function calcMatrix(response, status) {
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


                        var newRow = $("<tr>");

                        createNewRow();
                        newRow.find('#name').html(spots[j].name);
                        newRow.find('#address').html(to);
                        newRow.find('#distYou').html(distance);
                        newRow.find('#timeYou').html(duration);
                        $('#tableDiv').append(newRow);
                    }
                }
                $('#yourLocDiv').append("Your Location: " + from + "<br>");

                function createNewRow() {
                    newRow.append("<td id='name'></td>")
                    newRow.append("<td id='address'></td>")
                    newRow.append("<td id='distYou'></td>")
                    newRow.append("<td id='timeYou'></td>")
                    // newRow.append("<td id='distThem'></td>")
                    // newRow.append("<td id='timeThem'></td>")
                    newRow.addClass('option');
                    newRow.attr("data-name", spots[j].name);
                }
            }

            else console.log(status);
        };
    }; //end of doDistanceMatrix

    $('#tableDiv').on('click', '.option', function () {
        $('#name').html($(this).data('name'));
    });
}
});