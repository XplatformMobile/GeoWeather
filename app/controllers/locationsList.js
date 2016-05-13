// Default code (unnecessary?)
/*
// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
*/

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
