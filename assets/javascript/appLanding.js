
$(document).ready(function(){
//*****************************************************
//  FIREBASE RELATED MODULES
//******************************************************


var personAexists = false;
var personBexists = false;
var you = "C";

var data = new Firebase("https://anonymeetut.firebaseio.com/");
var dataPersonA = new Firebase("https://anonymeetut.firebaseio.com/personA");
var dataPersonB = new Firebase("https://anonymeetut.firebaseio.com/personB");
var fbStatus = new Firebase("https://anonymeetut.firebaseio.com/status");

var personA = {
	address: "",
	city: "",
	zip: ""};

var personB = {
	address: "",
	city: "",
	zip: ""};


//  function for user input validation 
//  

var formattedaddress;

function validateAddress(person) {
    var APIKey = 'uv-4dfc13ee82fb54f7c8bd2adde6aa07f4';
    var countryCode = 'US';
    person.APIKey = 'uv-4dfc13ee82fb54f7c8bd2adde6aa07f4';   
   $.ajax({
        url: 'http://api.address-validator.net/api/verify' + "?StreetAddress=" + person.address + "&City=" + person.city + "&PostalCode=" + person.zip + "&CountryCode=" + countryCode + "&APIKey=" + person.APIKey,
        type: 'GET',
        data: person,
        dataType: 'json'
    	})

   // wait until you get the response
    .done(function(response) {
        if (typeof(response.status) != "undefined") {
            status = response.status;
            formattedaddress = response.formattedaddress;
            }
         if (you=="A") {
       		 dataPersonA.set({
				'streetNumber': response.streetnumber,
				'street': response.street,
				'city': response.city,
				'zip': response.postalcode
				})
       		};
         if (you=="B") {
       		 dataPersonB.set({
				'streetNumber': response.streetnumber,
				'street': response.street,
				'city': response.city,
				'zip': response.postalcode
				})
       		};

    	});
	};

$("#addressform").on("submit", function() {

	event.preventDefault();
	meetURL = "meetMeat.html"

	// Find out if someone else is person A already
	// If not, user is person A 
	if (personAexists == false) {

		personA.address = $('#address').val().trim();
		personA.city = $('#city').val().trim();
		personA.zip = $('#zip').val().trim();
		you = "A";

		//  call user input validation function here
		// save user info in firebase
		validateAddress(personA);
		}

	// If the other person has input first, you are person B
	// If two people already using, *****hide input form
	//  and user would not be able to submit form
	else if ((personAexists == true) && (personBexists == false)) {


		personB.address = $('#address').val().trim();
		personB.city = $('#city').val().trim();
		personB.zip = $('#zip').val().trim();
		you = "B";

		//  call user input validation function here
		// Save user info in firebase.
		validateAddress(personB);
		};
	});  //end of submit form event handler


// At the initial load and any change, find out if Person A exists
dataPersonA.on("value", function(snapshot) {
	if (snapshot.exists()) {
		personAexists = true;

		switch(you) {
		case "A":
			if (personBexists) {
				$("#statusDiv").html("");
				personB = snapshot.val();
				var newPage = meetURL;
				window.location.replace(newPage);
				fbStatus.set("Start"); //start processing
				}
			if (!personBexists) $("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
			break;
		case "B":
			$("#statusDiv").html("");
			personA = snapshot.val();
				var newPage = meetURL;
				window.location.replace(newPage);

			fbStatus.set("Start"); //start processing
			break;
		case "C":
			if (personBexists) $("#statusDiv").html("<h2>You are a third wheel!</h2>");
			// *** Disable Form
			if (!personBexists) $("#statusDiv").html("<h2> Enter Your Info </h2>");
			break;
		default:
			console.log("error")
			}
		}
	else {
		personAexists = false;
			switch(you) {
			case "B":
				$("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
				break;
			case "C":
				$("#statusDiv").html("<h2> Enter Your Info </h2>");
				break;
			default:
				console.log("error")
			};
		
		}
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	});

// At the initial load and any change, find out if Player 2 exists
dataPersonB.on("value", function(snapshot) {
	if (snapshot.exists()) {
		personBexists = true;
		switch(you) {
		case "B":
			if (personAexists) {
				$("#statusDiv").html(""); 
				personA = snapshot.val();
				var newPage = meetURL;
				window.location.replace(newPage);


				fbStatus.set("Start"); //start processing
				};
			if (!personAexists) $("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
			break;
		case "A":
			$("#statusDiv").html("");
			personB = snapshot.val();
				var newPage = meetURL;
				window.location.replace(newPage);

			fbStatus.set("Start"); //start processing
			break;
		case "C":
			if (personAexists) $("#statusDiv").html("<h2>You are a third wheel!</h2>");
			// *** Disable Form

			if (!personAexists) $("#statusDiv").html("<h2> Enter Your Info </h2>");
			break;
		default:
			console.log("error");
			}	
		}
	else {
		personBexists = false;
		switch(you) {
			case "A":
				$("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
				break;
			case "C":
				$("#statusDiv").html("<h2> Enter Your Info </h2>");
				break;
			default:
				console.log("error");
			};
		
		}		
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	});

fbStatus.on("value", function(snapshot) {
	if (snapshot.val()=="Start") console.log("call processing function from here");
	if (snapshot.val()=='stop') console.log("reset everything");
	});

}); // end of document.ready

// ************************ 
//          SPARE PARTS
//  DON'T KNOW IF WE NEED THIS.  DISCARD AT END IF NOT NEEDED
//     JSON stringify and then parse so you can see the lat and long values
//		var placesResult = JSON.stringify(results);
//		yourNearbyLocations = JSON.parse(placesResult); 
//		console.log (yourNearbyLocations);
//		$('#result').append("places: " + placesResult)


// NOT USING THESE LISTENERS, DISCARD IF NOT NEEDED AT ALL
//  KEEPING FOR NOW JUST IN CASE....
//
// listener for user clicking on "show places" button

// $('#show-places').on("click", function(event){
// 	event.preventDefault();
// 	var bounds = new google.maps.LatLngBounds();
// 	// extend the boundaries of the map for each marker
// 	for (var i=0; i < markers.length; i++) {
// 		markers[i].setMap(map);
// 		bounds.extend(markers[i].position);
// 	};
// 	map.fitBounds(bounds);
// });

// listener for user clicking on "hide places" button

// $('#hide-places').on("click", function(event){
// 	event.preventDefault();
// 	for (var i=0; i < markers.length; i++) {
// 		markers[i].setMap(null);
// 	};
// });

