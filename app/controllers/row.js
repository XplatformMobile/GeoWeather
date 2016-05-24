// Arguments passed into this controller can be accessed via the `$.args` object directly or:



var args = $.args;

var dispatcher = require('dispatcher');

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
	
function moveLocation(e) {
	var location = locations.get(id);
    lat = location.get('latitude');
    long = location.get('longitude');

    var coords = { "latitude": lat, "longitude": long  };
    
  
    dispatcher.trigger('moveto',coords);
    dispatcher.trigger('closelist');
    
    
/*	
    working but leaks memmory like crazy
    Ti.App.fireEvent('moveto',coords );
	Ti.App.fireEvent('closelist'); */
		
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
