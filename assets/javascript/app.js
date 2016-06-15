// Group Project 

// cannot have initMap wait for document ready since
// google map API call is asynchronous

var map;

var spots = [];


function initMap() {


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

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 13,
		styles: styles,
		mapTypeControl: false
	});

	// this is the location for person A
	// including location for person B for now, but this
	// will eventually be in Firebase
	//
	var locationPersonA =	{lat: 30.2600, lng: -97.7400};
	var locationPersonB = 	{lat: 30.5555, lng: -97.8888};

	// PLACEHOLDER FOR CALCULATION OF MIDPOINT BETWEEN PERSON A AND PERONS B - midpoint used in places service call below


	


	// this is the pop-up window that appears when you
	// click on a marker
	var largeInfowindow = new google.maps.InfoWindow();

	//style the markers.  we use highlightedIcon
	//when user hovers over the marker
	var defaultIcon = makeMarkerIcon('0091ff');
	var highlightedIcon = makeMarkerIcon('FFFF24');


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



	// PLACES SERVICE - ET NEARBY PLACES
	//

	var serviceP = new google.maps.places.PlacesService(map);
	var midpoint = new google.maps.LatLng(30.2600, -97.7400);
	var request = {
		location: midpoint,
		radius: '500',
		types: ['restaurant']
	};


	serviceP.nearbySearch(request, findPlaces);

	function findPlaces (results, status){
		if (status == google.maps.places.PlacesServiceStatus.OK) {

// I JSON stringify and then parse so you can see the lat and long values
//		var placesResult = JSON.stringify(results);
//		yourNearbyLocations = JSON.parse(placesResult); 
//		console.log (yourNearbyLocations);
//		$('#result').append("places: " + placesResult)

			for (var i=0; i < results.length; i++) {
				var place = results[i];
				var position = place.geometry.location;
				var title = place.name;
				spots.push(position);
				createMarker(results[i]);
			}

		};
	doDistanceMatrix();
	};


	function createMarker(place) {

			//create marker per location and place on map
		var marker = new google.maps.Marker({
			map: map, // this places the marker on the map
			position: place.geometry.location,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
	//		id: i
			});
			// create an onclick event to open an infowindow at each marker
			marker.addListener('click', function(){
				populateInfoWindow(this,largeInfowindow);
			});
	//		marker.addListener('click', function(){
	//			infowindow.setContent(place.name);
	//			infowindow.open(map, this);
	//		});

			marker.addListener("mouseover", function(){
				this.setIcon(highlightedIcon);
			});
			marker.addListener("mouseout", function(){
				this.setIcon(defaultIcon);
			});

		function populateInfoWindow(marker, infowindow) {
			// check to make sure the infowindow is not already opened in this marker.
			if (infowindow.marker != marker) {
				infowindow.marker = marker;
				infowindow.setContent('<div>'+place.name+'</div>');
				infowindow.open(map, marker);
				// make sure the marker property is cleared if the infowindow is closed.
				infowindow.addListener('closeclick', function(){
					infowindow.setMarker(null);
				});
			}
		}
	}
	//CODE FOR DISTANCE MATRIX SERVICE
	function doDistanceMatrix(){

		var serviceD = new google.maps.DistanceMatrixService();

		serviceD.getDistanceMatrix(
			{ 
			origins: [locationPersonA],
			destinations: spots,
			travelMode: google.maps.TravelMode.DRIVING,
			// transitOptions: TransitOptions,
			// drivingOptions: DrivingOptions,
			// unitSystem: UnitSystem,
			avoidHighways: false,
			avoidTolls: false,
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
	}; //end of doDistanceMatrix
}  //end of initMap function

$(document).ready(function(){
// listener for user clicking on "show listing" button

$('#show-listing').on("click", function(event){
	event.preventDefault();
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




}); // end of document.ready
