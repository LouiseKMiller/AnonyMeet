
$(document).ready(function(){
//*****************************************************
//  FIREBASE RELATED MODULES
//******************************************************


var personAexists = false;
var personBexists = false;
var you = "C";

var data = new Firebase("https://anonymeetut.firebaseio.com/");
var fbPeople = new Firebase("https://anonymeetut.firebaseio.com/people");
var fbPersonA = fbPeople.child('/personA');

var fbPersonB = fbPeople.child('/personB');
var fbStatus = data.child('/status');

var personA = {};

var personB = {};

var yourCode;

//  function for user input validation 
//  also store result in firebase

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
       		 fbPersonA.set({
       		 	'name': person.name,
         	 	'code': person.code,
				'streetNumber': response.streetnumber,
				'street': response.street,
				'city': response.city,
				'zip': response.postalcode
				});
       		};

         if (you=="B") {
        		fbPersonB.set({
        		'name': person.name,
        		'code': person.code,
				'streetNumber': response.streetnumber,
				'street': response.street,
				'city': response.city,
				'zip': response.postalcode
				})
       		};

fbPeople.orderByChild("code").on("child_added", function(newSnapshot) {
  	var newCode = newSnapshot.val().code;
  	if (newCode == yourCode) {
  		console.log ("match found");
  		}
    else {
        console.log("There is no match");
     	}
  	});


	fbPeople.orderByChild("code").on("child_added", function(snapshot) {
  		console.log(snapshot.key() + " has " + snapshot.val().code + " code");
		});






    	});
	};


$("#addressform").on("submit", function() {

	event.preventDefault();
	meetURL = "meetMeat.html"

	// Find out if someone else is person A already
	// If not, user is person A 
	if (personAexists == false) {

		personA.name = $('#name').val().trim();
		personA.address = $('#address').val().trim();
		personA.city = $('#city').val().trim();
		personA.zip = $('#zip').val().trim();
		personA.code = $('#code').val().trim();
		you = "A";
		yourCode = personA.code;

		//  call user input validation function here
		// save user info in firebase
		validateAddress(personA);
		}

	// If the other person has input first, you are person B
	// If two people already using, *****hide input form
	//  and user would not be able to submit form
	else if ((personAexists == true) && (personBexists == false)) {


		personB.name = $('#name').val().trim();
		personB.address = $('#address').val().trim();
		personB.city = $('#city').val().trim();
		personB.zip = $('#zip').val().trim();
		personB.code = $('#code').val().trim();
		you = "B";
		yourCode = personB.code;

		//  call user input validation function here
		// Save user info in firebase.
		validateAddress(personB);
		};
	});  //end of submit form event handler


// At the initial load and any change, find out if Person A exists
fbPersonA.on("value", function(snapshot) {
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
fbPersonB.on("value", function(snapshot) {
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

