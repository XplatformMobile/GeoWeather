// function to get coordinates from the pressed location on map
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



// registers a callback fn. that removes the annotation when user closes the annotation or
// clicks the map outside the annotation
$.map.addEventListener('click', function(e) {
	if (e.annotation && (e.clicksource === 'leftButton' || e.clicksource == 'leftPane')) {
		$.map.removeAnnotation(e.annotation);
	}
});


//
// Open a browser window if you tap on the right
//
$.map.addEventListener('click', function(e) {
	// debug::: alert(e.clicksource);
	// debug::: alert(e.annotation);
		
	// if we are in an annotation and either title, infoWindow or subtitle was clicked
	// launch or web window
	if (e.annotation &&   (e.clicksource == 'title') || (e.clicksource == 'infoWindow' ) || (e.clicksource == 'subtitle') ) {
		
		// should try {height} etc
		
		
		var win = Ti.UI.createWindow();
	
		// access previously set globals.
			
		
	    // var longitude = Ti.App.currentLon;
	    // var latitude = Ti.App.currentLat;
	    
	    var longitude = e.annotation.getLongitude();
	    var latitude = e.annotation.getLatitude();
	    
	    
		
		var weathergovbaseURL = 'http://forecast.weather.gov/MapClick.php?';
		
		var weathergovURL = weathergovbaseURL + "lat=" + latitude + "&lon=" + longitude;
		
		// debug:::: alert (weathergovURL);
		
		
				
		var webview = Ti.UI.createWebView({
		url: weathergovURL });
			win.add(webview);
		
		win.open();
	    win.add(webview);
	 
	}
});


// function that adds new pushpin to the map from a longpress on the map location
// longpress is broke without some kind of container/overlay
// longclick doesn't return any event information 
// considering alternatives
// Looks like there is a container, but how to intercept the events.


$.map.addEventListener("longpress", function(e) {
	if (e.annotation && (e.clicksource === 'leftButton' || e.clicksource == 'leftPane')) {
		$.map.removeAnnotation(e.annotation);
	}
	
	alert (e.x);
	alert (e.y);
	
   	var coordinate = calculateLatLngfromPixels($.map, e.x, e.y);

	var longitude = coordinate.lon;	
	var latitude = coordinate.lat;

	var coords = coordinate.lat + " " + coordinate.lon;
	alert(coords)
	geo.forwardGeocode(coords, function(geodata, weather) {
		// send request to geo library with coordinates to get location info and weather
		exports.addAnnotation(geodata, weather);
		// the function call above shows the pushpin on the map
	});
});


// called when a new pushpin is added to the map
exports.addAnnotation = function(geodata, weather) {
	alert(geodata.title);
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
	
	// pinnowjs: set a global for the coordinates
	// Turns out I don't need globals. 
	// Ti.App.currentLat = geodata.coords.latitude;
	// Ti.App.currentLon = geodata.coords.longitude;
	
	
	$.map.setLocation({
		latitude : geodata.coords.latitude,
		longitude : geodata.coords.longitude,
		latitudeDelta : 1,
		longitudeDelta : 1
	});
};


/*
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
 be chosen by the field[3](day) or field[4](night). In this project it was not possible, so the day icon was chosen.

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
