// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

function additem() {
	var locations = Alloy.Collections.location;
	
	// TODO: Create a way to fill in the rest of the columns (i.e., locationName, temperature,
	// units, and description)
	// Create a new model for the location collection
	var address = Alloy.createModel('Location', {
		latitude : $.latitudeTextField.value,
		longitude : $.longitudeTextField.value
	});
	
	// Add new model to the global collection
	locations.add(address);
	
	// Save the model to persistent storage
	address.save();
	
	// TODO: Create a way to add item to the main page
	
	// Reload the locations
	locations.fetch();
	
	closeWindow();
}

function focusLongitudeTextField() {
	$.longitudeTextField.focus();
}

function closeKeyboard(e) {
	e.source.blur();
}

function closeWindow() {
	$.addLocationListItemWin.close();
}
