// Default code (unnecessary?)
/*
// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
*/

var geo = require('geo');
var dispatcher = require('dispatcher');

var locations = Alloy.Collections.location;

// Open the app's Location List window
$.locationListWin.open();

dispatcher.on('closelist', closeWindow);		// calls method below to return to the map view

// Fetch existing location items from storage (unless locations is null)
locations && locations.fetch();

// Is this necessary? (Originally from To-Do-List's index.js)
function transformFunction(model) {
	var transform = model.toJSON();
	return transform;
}

function closeWindow() {
	$.locationListWin.close();
	// have to remove listener or it causes memory leak. Ti listeners are persistent.
	//
}

// Define a click event handler on the + button
$.button.addEventListener('click', function(e) {
	closeWindow();
	dispatcher.trigger('textfield', {textfield: $.textField.value});			
});

$.pushpins.addEventListener('click', function(e) {
	closeWindow();		
});

/* this doesn't work 
exports.destroy = function() {
    // Remove the listener first
    Ti.App.addRemoveListener('closelist');
    $.destroy();
};

*/

