var geo = require('geo');
var dispatcher = require('dispatcher');


// Define a click event handler on the + button
$.button.addEventListener('click', function(e) {
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

dispatcher.on('textfield', function(e) {
	geo.forwardGeocode(e.textfield, function(geodata, weather) {
		$.trigger('addAnnotation', {
			geodata : geodata,
			weather : weather
		});
	});
});




$.pushpins.addEventListener('click', function(e) {
	
		Alloy.createController('locationsList').getView().open();
			
		
});



