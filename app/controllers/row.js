// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var moment = require('alloy/moment');
var locations = Alloy.Collections.location;
var id;

// $model represents the current model accessible to this
// controller from the markup's model-view binding. $model
// will be null if there is no binding in place.
if ($model) {
	id = $model.id;
	$.row.backgroundColor = '#fff';
	// White
	$.location.color = '#000';
	// Color text black
}

function zoomLocation(e) {
	var location = locations.get(id);
	alert (location.get('locationName'));
     
}

function deleteLocation(e) {
	// Prevent bubbling up to the row
	e.cancelBubble = true;

	// Find the location by id
	var location = locations.get(id);
	// local location != global location

	// Destroy the model from persistence layer, which will in turn remove
	// it from the collection, and model-view binding will automatically
	// reflect this in the tableview
	location.destroy();
}
