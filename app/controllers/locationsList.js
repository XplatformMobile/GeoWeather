// Default code (unnecessary?)
/*
// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
*/

var geo = require('geo');
var locations = Alloy.Collections.location;

// Open the app's Location List window
$.locationListWin.open();

// Fetch existing location items from storage (unless locations is null)
locations && locations.fetch();

// Is this necessary? (Originally from To-Do-List's index.js)
function transformFunction(model) {
	var transform = model.toJSON();
	return transform;
}

// Open the "Add Location" window
function addLocation() {	// loads the "addLocationListItem" component
	Alloy.createController("addLocationListItem").getView().open();
}

function closeWindow() {
	$.locationListWin.close();
}


// Define a click event handler on the + button
$.button.addEventListener('click', function(e) {
	closeWindow();			
	$.textField.blur();	// Hides the keyboard
	// Send the location name and callback fn to forwardGeocode fn.
	// geodata is the GeoInfo var populated by geo.js
	// weather is WeatherInfo var populated by geo.js
	geo.forwardGeocode($.textField.value, function(geodata, weather) {
		$.trigger('addAnnotation', {
			geodata : geodata,
			weather : weather
		});
	});
});

$.pushpins.addEventListener('click', function(e) {
	closeWindow();		
});


