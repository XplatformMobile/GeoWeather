var dispatcher = require('dispatcher');

var calculateLatLngfromPixels = function(mapview, xPixels, yPixels) {
// Function to get coordinates from the pressed location on map
// returns JSON with latitude and longtitude
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

dispatcher.on('moveto', function moveto(e) {
// Document what's going on here please!
    $.map.setLocation({
		latitude : e.latitude,
		longitude :e.longitude,
		latitudeDelta : 1,
		longitudeDelta : 1
	});
});

// Registers a callback fn. that removes the annotation when user closes the annotation or
// clicks the map outside the annotation
$.map.addEventListener('click', function(e) {
	if (e.annotation && (e.clicksource === 'leftButton' || e.clicksource == 'leftPane')) {
		$.map.removeAnnotation(e.annotation);
	}
});

// Open a browser window if you click/tap on the weather icon (rightButton) in an annotation
$.map.addEventListener('click', function(e) {
	// If we are in an annotation and either title, infoWindow or subtitle was clicked
	// then launch our web window  - Rightbutton weather icon is for iOS.
	// iOS, needs rightButton event (should try {height} etc.)
	if (e.annotation && ((e.clicksource == 'title') || (e.cliksource == 'rightPane') || (e.clicksource == 'rightButton' )
		|| (e.clicksource == 'infoWindow' ) || (e.clicksource == 'subtitle'))) {

		// access previously set globals.
	    // var longitude = Ti.App.currentLon;
	    // var latitude = Ti.App.currentLat;
	    
	    // var longitude = e.annotation.longitude;
	    // var latitude = e.annotation.latitude;

		//var weathergovbaseURL = 'http://forecast.weather.gov/MapClick.php?';
		//var weathergovURL = weathergovbaseURL + "lat=" + latitude + "&lon=" + longitude;
		//var weatherdotcomURL = 'https://weather.com/weather/today/l/' + e.annotation.city_id;
		var yahooweatherURL = e.annotation.weather_url;
		
		// debug:::: alert (weathergovURL);
		var webwin = Ti.UI.createWindow();
		var webview = Ti.UI.createWebView({
			url : yahooweatherURL
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

function reverseGeocodeAnnotation(coords) {	// called on a longclick event (see map.xml)
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
	    geo.setupWeatherBuild(address, lat, lon, zipcode, function(geodata, weather) { // tried to call forwardGeocode() but URL can't take City ID
		    exports.addAnnotation(geodata, weather);
	   });
 });
}

function setupWeatherAnnotation(title, coords) { // called to setup pins from DB (see below)
  'use strict';
         // Call reverseGeocoder to get the zip
		Ti.Geolocation.reverseGeocoder(coords.latitude, coords.longitude, function(e) {
    	if (!e.success || e.error) {
      		return alert(e.error || 'Could not reverse geocode the position.');
    	}
    	// Use the title as the address
    	var address = title;
		var lat = coords.latitude;
		var lon = coords.longitude;
		var zipcode = e.places[0].zipcode;
		// need explicit call to exports.addAnnotation because of its function name
	    geo.setupWeatherBuild(address, lat, lon, zipcode, function(geodata, weather) { // tried to call forwardGeocode() but URL can't take City ID
		    exports.addAnnotationToMap(geodata, weather);
	   });
 });
}

exports.addAnnotation = function(geodata, weather)
{ // called from trigger in addAddress.js
	//alert("in exports.addAnotation");
	exports.addAnnotationToMap(geodata, weather);
	
	var locations = Alloy.Collections.location;
	locations.fetch();	
	// Create a new model for the location collection
	var address = Alloy.createModel('Location', {
	    locationName : geodata.title,
        latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
		weather_url: geodata.weather_url	// should value be city_id? -JJB
	});

	// Add new model to the global collection
	locations.add(address);

	// Save the model to persistent storage
	address.save();

	// Reload the locations
	locations.fetch();
};

exports.loadpins = function(e) {
	var locations = Alloy.Collections.location;
    locations.fetch();
    locations.each( function(loc) {
    	var coords = {
    		"latitude": loc.get('latitude'),
    		"longitude": loc.get('longitude')
    	};
    	var locname = loc.get('locationName');
// maybe I should get City ID from the DB?
    	setupWeatherAnnotation(locname, coords);
    	// maybe a delay fn will help load all pins from DB -JJB
//		setTimeout(function(){ /* wait loop*/ }, 1000);	// time is in milliseconds
    });
};

// Called when a new pushpin is added to the map
exports.addAnnotationToMap = function(geodata, weather) {
	// alert(geodata.title);	// echos location info to the user
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
		rightButton : image_icon,
		weather_url: geodata.weather_url	// should value be city_id? -JJB
	});
	
	$.map.addAnnotation(annotation.getView());	// calls into ti.map.MapView.addAnnotation()
												// and NOT into exports.addAnnotation() above!
	$.map.setLocation({
		latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
		latitudeDelta : 1,
		longitudeDelta : 1
	});
};

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
