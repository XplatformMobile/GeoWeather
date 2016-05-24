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


Ti.App.addEventListener('closelist', function closelist(e) {
	closeWindow();	

	 
});


	
function closeWindow() {
	$.locationListWin.close();
}


// Define a click event handler on the + button
$.button.addEventListener('click', function(e) {
	closeWindow();			
	
});

$.pushpins.addEventListener('click', function(e) {
	closeWindow();		
});


