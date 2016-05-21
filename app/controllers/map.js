// Function to get coordinates from the pressed location on map
// returns JSON with latitude and longtitude
var calculateLatLngfromPixels = function(mapview, xPixels, yPixels) {
	var region = mapview.actualRegion || mapview.region;
	var widthInPixels = mapview.rect.width;
	var heightInPixels = mapview.rect.height;

	// should invert because of the pixel reference frame
	heightDegPerPixel = -region.latitudeDelta / heightInPixels;
	widthDegPerPixel = region.longitudeDelta / widthInPixels;

	return {
		lat : (yPixels - heightInPixels / 2) * heightDegPerPixel + region.latitude,
		lon : (xPixels - widthInPixels / 2) * widthDegPerPixel + region.longitude
	};
};

// Registers a callback fn. that removes the annotation when user closes the annotation or
// clicks the map outside the annotation
$.map.addEventListener('click', function(e) {
	if (e.annotation && (e.clicksource === 'leftButton' || e.clicksource == 'leftPane')) {
		$.map.removeAnnotation(e.annotation);
	}
});

// Open a browser window if you tap on the right (of what? -JJB)
$.map.addEventListener('click', function(e) {
	// If we are in an annotation and either title, infoWindow or subtitle was clicked
	// launch or web window  - Rightbutton weather icon for iOS
	
	// iOS, needs rightButton event 
	if (e.annotation && (e.clicksource == 'title') || (e.cliksource == 'rightPane') || (e.clicksource == 'rightButton' )
		|| (e.clicksource == 'infoWindow' ) || (e.clicksource == 'subtitle') ) {
		// should try {height} etc
		var webwin = Ti.UI.createWindow();

		// access previously set globals.		
	    // var longitude = Ti.App.currentLon;
	    // var latitude = Ti.App.currentLat;
	    
	    var longitude = e.annotation.getLongitude();
	    var latitude = e.annotation.getLatitude();	   		

		var weathergovbaseURL = 'http://forecast.weather.gov/MapClick.php?';

		var weathergovURL = weathergovbaseURL + "lat=" + latitude + "&lon=" + longitude;

		// debug:::: alert (weathergovURL);

		var webview = Ti.UI.createWebView({
			url : weathergovURL
		});
	
		webwin.open();
		webwin.add(webview);

		// added a close button
		var closeWebView = Ti.UI.createButton({
			title : 'close',
			left : 5,
			bottom : 10
		});
		webwin.add(closeWebView);

		closeWebView.addEventListener('click', function() {
			webwin.close();
		});
	}
});

function reverseGeocodeAnnotation(coords, center) {
  'use strict';				
		Ti.Geolocation.reverseGeocoder(coords.latitude, coords.longitude, function(e) {	
    	if (!e.success || e.error) {
      		return alert(e.error || 'Could not reverse geocode the position.');
    	}
    	// Use the address of the first place found for the title
    	// location.title = e.places[0].address;
    	var address = e.places[0].address;
    	address = address.replace("United States of America","USA");
		var lat = e.places[0].latitude;
		var lon = e.places[0].longitude;
		var zipcode = e.places[0].zipcode;
		// need explicit call to exports.addAnnotation because of its function name
	    geo.setupWeatherBuild(address,lat,lon,zipcode, function(geodata,weather) {    				
		    exports.addAnnotation(geodata, weather);
	   });
 });
}

function firstAnnotation() {	
	geo.forwardGeocode("MSOE", function(geodata, weather) {
		$.trigger('addAnnotation', {
			geodata : geodata,
			weather : weather
		});
	});
}


exports.addAnnotation = function (geodata, weather)
{
	exports.addAnnotationToMap(geodata,weather);	
	
	var locations = Alloy.Collections.location;
	// Create a new model for the location collection
	var address = Alloy.createModel('Location', {
	    locationName : geodata.title,
        latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
	});

	// Add new model to the global collection
	locations.add(address);

	// Save the model to persistent storage
	address.save();

	// TODO: Create a way to add item to the main page

	// Reload the locations
	locations.fetch();
};



// Called when a new pushpin is added to the map
exports.addAnnotationToMap = function(geodata, weather) {	
	alert(geodata.title);	// echos location info to the user
	// populate the annotation's model defined in the file annotation.js
	if (weather != null || weather != undefined) {
		var tempInfo = weather.weather.curren_weather[0].temp;
		tempInfo += "°" + weather.weather.curren_weather[0].temp_unit.toUpperCase();
		var weatherCode = weather.weather.curren_weather[0].weather_code;
		tempInfo += " " + getWeatherIcon(weatherCode).weather_text;
		var image_icon = "/weather_icons/" + getWeatherIcon(weatherCode).image_icon;
	} else {
		tempInfo = "No weather found :(";
	}

	var annotation = Alloy.createController('annotation', {
		title : geodata.title,
		subtitle : tempInfo,
		latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
		rightButton : image_icon
	});
	$.map.addAnnotation(annotation.getView());

	
	$.map.setLocation({
		latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
		latitudeDelta : 1,
		longitudeDelta : 1
	});
};

/*
// Was this the original addAnnotation fn from GeoCoder?  -JJB
exports.addAnnotation = function(geodata) {
	var annotation = Alloy.createController('annotation', {
		title : geodata.title,
		subtitle : geodata.zip,
		latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude
	});
	$.map.addAnnotation(annotation.getView());
	$.map.setLocation({
		latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
		latitudeDelta : 1,
		longitudeDelta : 1
	});
}; 
*/

/**Method that will get the weather information and the day Icon. If possible, see if it is day or night as the icon can
 be chosen by the field[3](day) or field[4](night). The night icon didn't look very useful, so the day icon was chosen.

 @return: JSON with weather_text and the image_icon's path. In case the weather_code is invalid or the method
 for some reason could not create the JSON, a JSON with weather_text and image_icon with values "N/A" is returned.
 An example of a matching JSON for weather_code = 2 can be seen below:
 JSON = { weather_text: "Cloudy skies" , image_icon: "Cloudy.gif" }
 **/
var getWeatherIcon = function(weather_code) {
	// Test if the weather code is invalid
	if (weather_code > 94 || weather_code < 0) {
		weather_code = -999;
	}
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "WebService_WeatherCondition.csv");
	var blob = file.read();
	var readText = blob.text;
	//spliting the file into lines
	var Lines = readText.split("\n");
	var JSON = {
		weather_text : "N/A",
		image_icon : "N/A"
	};
	// Search for the weather code in field[0] of the line
	for (var i = 0; i < Lines.length; i++) {
		field = Lines[i].split(",");
		if (field[0] == weather_code) {
			JSON = {
				weather_text : field[1],
				image_icon : field[3]
			};
			break;
			// exits the for loop; stops searching lines for the weather code
		}
	}
	return JSON;
};

