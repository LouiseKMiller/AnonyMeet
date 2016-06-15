// Group Project 

// cannot have initMap wait for document ready since
// google map API call is asynchronous

var map;
var markers = [];
var largeInfowindow ;

//style the markers.  we use highlightedIcon
//when user hovers over the marker
var defaultIcon;
var highlightedIcon;

function initMap() {

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
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 13,
		styles: styles,
		mapTypeControl: false
	});
	
	// this is the location for the marker
	// you can make this an array of marker objects
	// or a single location as follows:
	//var tribeca = {lat: 40.719526, lng: -74.0089934};
	//
	var locations = [
		{title: 'Park Ave Penthouse', location: {lat: 30.2600, lng: -97.7400}},
		{title: 'Chelsea Loft', location: {lat: 30.5555, lng: -97.8888}}

	];

	// this is the pop-up window that appears when you
	// click on a marker
	largeInfowindow = new google.maps.InfoWindow();

	//style the markers.  we use highlightedIcon
	//when user hovers over the marker
	defaultIcon = makeMarkerIcon('0091ff');
	highlightedIcon = makeMarkerIcon('FFFF24');

	// this loop goes through the locations array
	// and creates a marker for each location
	// then pushes the marker information into an array
	//  Creates listeners for each marker
	//  so the infowindow will open when user
	//  clicks on the marker, and marker will highlight when
	//  mouseover, then return to normal on mouseout
	//
	for (var i = 0; i<locations.length; i++) {
		// get the position from the locations array
		var position = locations[i].location;
		var title = locations[i].title;
		//create marker per location and push into markers array
		var marker = new google.maps.Marker({
			position: position,
			title: title,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id: i
		});
		// push the marker to our array of markers
		markers.push(marker);
		// create an onclick event to topen an infowindow at each marker
		marker.addListener('click', function(){
			populateInfoWindow(this,largeInfoWindow);
		});

		marker.addListener("mouseover", function(){
			this.setIcon(highlightedIcon);
		});
		marker.addListener("mouseout", function(){
			this.setIcon(defaultIcon);
		});
	}

	// function for populating the infowindow that appears when 
	// user clicks on marker

	function populateInfoWindow(marker, infowindow) {
		// check to make sure the infowindow is not already opened in this marker.
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent('<div>'+marker.title+'</div>');
			infowindow.open(map, marker);
			// make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function(){
				infowindow.setMarker(null);
			});
		}
	}

	// function for stylizing the markers.  Not sure I understand
	// the call yet.  Need to look into this further.
	//
	function makeMarkerIcon(markerColor){
		var markerImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_spin&chld=1.15|0|"+ markerColor + "|40|_|%E2%80%A2",
			new google.maps.Size(21,34),
			new google.maps.Point(0,0),
			new google.maps.Point(10,34),
			new google.maps.Size(21,34));
		return markerImage;
	};
}  //end of initMap function

// listener for user clicking on "show listing" button

$('#show-listing').on("click", function(event){
	event.preventDefault();
	console.log("You ARE HERE");
	var bounds = new google.maps.LatLngBounds();
	// extend the boundaries of the map for each marker
	for (var i=0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	};
	map.fitBounds(bounds);
});

// listener for user clicking on "hide listing" button

$('#hide-listing').on("click", function(event){
	event.preventDefault();
	for (var i=0; i < markers.length; i++) {
		markers[i].setMap(null);
	};
});


$(document).ready(function(){
	console.log ("hello");
//CODE FOR DISTANCE MATRIX SERVICE
var origin1 = new google.maps.LatLng(30.2600, -97.7400);
var origin2 = new google.maps.LatLng(30.2700, -97.7440);
var origin3 = new google.maps.LatLng(30.2650, -97.7300);
var destinationA = new google.maps.LatLng( 30.2615, -97.7410);
var destinationB = new google.maps.LatLng( 30.2627, -97.7450);
var destinationC = new google.maps.LatLng( 30.2613, -97.7510);

var serviceD = new google.maps.DistanceMatrixService();
serviceD.getDistanceMatrix(
	{ 
	origins: [origin1, origin2, origin3],
	destinations: [destinationA, destinationB, destinationC],
	travelMode: google.maps.TravelMode.DRIVING,
	// transitOptions: TransitOptions,
	// drivingOptions: DrivingOptions,
	// unitSystem: UnitSystem,
	// avoidHighways: Boolean,
	// avoidTolls: Boolean,
	}, calcMatrix);

function calcMatrix (response, status){
	if (status == google.maps.DistanceMatrixStatus.OK) {
		var origins = response.originAddresses;
		var destinations = response.destinationAddresses;

		for (var i=0; i < origins.length; i++) {
			var results = response.rows[i].elements;
			for (var j=0; j < results.length; j++) {
				var element = results[j];
				var distance = element.distance.text;
				var duration = element.duration.text;
				var from = origins[i];
				var to = destinations[j];
				$('#result').append("origin: " + from+"<br>");
				$('#result').append("destination: " + to+"<br>");
				$('#result').append("distance: "+distance+"<br>");
				$('#result').append("duration: "+duration+"<br>");
			}
		}
	}
	else console.log (status);
};

//CODE FOR PLACES SERVICE
var serviceP = new google.maps.places.PlacesService(map);
var request = {
	location: origin1,
	radius: '500',
	types: ['store']
};

serviceP.nearbySearch(request, findPlaces);

function findPlaces (results, status){
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i=0; i < results.length; i++) {
			var place = results[i];
			createMarker(results[i]);
		}
	console.log (results);
	var placesResult = JSON.stringify(results);
	$('#result').append("places: " + placesResult)
	};
};

function createMarker(place) {
	var placeLoc = place.geometry.location;
		//create marker per location and push into markers array
	var marker = new google.maps.Marker({
		position: place.geometry.location,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP,
//		id: i
	});
	// create an onclick event to open an infowindow at each marker
	marker.addListener('click', function(){
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});

	marker.addListener("mouseover", function(){
		this.setIcon(highlightedIcon);
	});
	marker.addListener("mouseout", function(){
		this.setIcon(defaultIcon);
	});
}

}); // end of document.ready
