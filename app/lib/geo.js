var GOOGLE_BASE_URL = 'http://maps.google.com/maps/api/geocode/json?address=';
var ERROR_MESSAGE = 'There was an error geocoding. Please try again.';
//Feel free to make myweather2.com account and add your uac to the array.
var IDs = ["2ODDrZ6ENt", "tml39kKXAG", "uIOWy9SFuf"];

var WeatherInfo = null;
var GeoInfo = null;

/*
 * 1 degree is approximately 69 miles length, longitude vary, but is pretty much same at equator. Margin of 0.1 should make the difference at approximately 7 miles.
 */
var margin = 0.1;
// Appcelerator HQ
var prevLat = 37.389569;
var prevLon = -122.050212;

// populates json data object
var GeoData = function(title, latitude, longitude, weather_url) {
	this.title = title;
	this.coords = {
		latitude : latitude,
		longitude : longitude
	};
	this.weather_url = weather_url;
};

/**
 * Delays the callback function, creates a weather JS Object that contains all relevant information about current weather.
 * @param {Object} lattitude \
 * @param {Object} longitude / Replaced zip by GPS coordinates (latitude, longitude).
 * @param {Object} callback - a fn. argument that is called when WeatherInfo is populated from the response.
 * @param {Object} iteration - Set to 0. Used internally when quota is exhausted to call itself recursively.
 */
var buildWeatherRequestByCoords = function(lat, lon, callback, iteration) {
	var uac = IDs[iteration];
	// Query Example:
	// http://www.myweather2.com/developer/forecast.ashx?uac=uIOWy9SFuf&output=json&query=43.0,-88.0&temp_unit=f&ws_unit=mph
	var request = "http://www.myweather2.com/developer/forecast.ashx?uac=" + uac + "&output=json&query=" + lat + "," + lon + "&temp_unit=f&ws_unit=mph";
	// JSON Response example:
	//{ "weather": { "curren_weather": [ {"humidity": "58", "pressure": "1032", "temp": "11", "temp_unit": "c", "weather_code": "1", "weather_text": "Partly cloudy",  "wind": [ {"dir": "E", "speed": "3", "wind_unit": "kph" } ] } ],  "forecast": [ {"date": "2015-04-20",  "day": [ {"weather_code": "3", "weather_text": "Overcast skies",  "wind": [ {"dir": "ENE", "dir_degree": "73", "speed": "22", "wind_unit": "kph" } ] } ], "day_max_temp": "17",  "night": [ {"weather_code": "0", "weather_text": "Clear skies",  "wind": [ {"dir": "ENE", "dir_degree": "68", "speed": "22", "wind_unit": "kph" } ] } ], "night_min_temp": "4", "temp_unit": "c" }, {"date": "2015-04-21",  "day": [ {"weather_code": "2", "weather_text": "Cloudy skies",  "wind": [ {"dir": "ENE", "dir_degree": "57", "speed": "22", "wind_unit": "kph" } ] } ], "day_max_temp": "16",  "night": [ {"weather_code": "3", "weather_text": "Overcast skies",  "wind": [ {"dir": "ENE", "dir_degree": "66", "speed": "22", "wind_unit": "kph" } ] } ], "night_min_temp": "5", "temp_unit": "c" } ] }}
	var xhr = Titanium.Network.createHTTPClient();
	xhr.open('GET', request);
	var json;
	// Holds the data returned from this fn.
	// onload is called on a successful AJAX query; 'this' is the response obj.
	xhr.onload = function() {
		var text = this.responseText;
		json = JSON.parse(text);
		WeatherInfo = json;
		callback(GeoInfo, WeatherInfo);
	};
	// We might have run out of daily quota. Try another uac code to get another helping
	xhr.onerror = function(e) {
		if (iteration < IDs.length) {
			buildWeatherRequestByCoords(lat, lon, callback, iteration + 1);
			return;
		} else {
			Ti.API.error(e.error);
			alert(ERROR_MESSAGE);
		}
	};
	// Sends the AJAX RESTful web service request
	xhr.send();
	//	return json; // returned object isn't being used! WeatherInfo holds it & was passed to callback fn.
};

// Make the following methods entry points into this component (via exports. keyword)

exports.setupWeatherBuild = function(address, lat, lon, weather_url, callback) {
	// Use this entry point when address (i.e. location) is fully known.
	GeoInfo = new GeoData(address, lat, lon, weather_url);
	buildWeatherRequestByCoords(lat, lon, callback, 0);
//	getCityIDAndSetGeoData(address, lat, lon, callback);	// tried to call this instead but URL can't take City ID
};

exports.forwardGeocode = function(address, callback) {
	// Use this entry point when only address (i.e. location) is known.
	if (Ti.Platform.osname === 'mobileweb') {
		forwardGeocodeWeb(address, callback);
	} else {
		forwardGeocodeNative(address, callback);
	}
};

/**
 * No longer callbacks itself, instead creates the address and delegates the callback to the buildWeatherRequestBy<x> method
 * @param {Object} address - the user-requested address to geolocate via the Google Maps API
 * @param {Object} callback - a fn. argument that is passed to buildWeatherRequestBy<x> when GeoInfo is populated from the response
 */
var forwardGeocodeNative = function(address, callback) {
	//alert("\"" + address + "\"");
	var xhr = Titanium.Network.createHTTPClient();
	var url = GOOGLE_BASE_URL + address.replace(' ', '+');
	url += "&sensor=" + (Titanium.Geolocation.locationServicesEnabled == true);
	xhr.open('GET', url);
	// onload is called on a successful AJAX query; 'this' is the response obj.
	xhr.onload = function() {
		var json = JSON.parse(this.responseText);
		if (json.status != 'OK') {
			alert('Unable to geocode the address');
			return;
		}
		// Process the AJAX RESTful response
		var addressComponents = json.results[0].address_components;
//		var zipcode = null;
//		for (var i = 0; i < addressComponents.length; i++) { //try to get zip code
//			if (addressComponents[i].types == "postal_code")
//				zipcode = addressComponents[i].long_name;
//		}
		address = json.results[0].formatted_address;
		var lat = json.results[0].geometry.location.lat;
		var lon = json.results[0].geometry.location.lng;

		var getWeather = function() {	// This is a callback fn used below.
			// If the new weather location is near the last one, ignore it and send back old WeatherInfo
			if (Math.abs(lat - prevLat) < margin && Math.abs(lon - prevLon) < margin && WeatherInfo != null) {
				alert("You are a bit close, don\'t you think?");
				callback(GeoInfo, WeatherInfo);
			} else { // Get the latest weather info.
				prevLat = lat;
				prevLon = lon;
				buildWeatherRequestByCoords(lat, lon, callback, 0);
			}	
		};
		
		var city_name = addressComponents[0].long_name;
		// In order to save one request, we can use the weather data from the mashape api.
		getWeatherURLAndSetGeoData(city_name, lat, lon, getWeather);
	};	// end onload() fn.
	// Something went wrong fetching location info. Bail out!
	xhr.onerror = function(e) {
		Ti.API.error(e.error);
		alert(ERROR_MESSAGE);
	};
	// sends the AJAX RESTful web service request
	xhr.send();
};

var getWeatherURLAndSetGeoData = function(location_name, lat, lon, callback) {
	var xhr = Titanium.Network.createHTTPClient();
	//var url = 'http://wxdata.weather.com/wxdata/search/search?where=' + location_name.replace(' ', '+');
	// Instead, use the Mashape site per Lucas Turcan's suggestion (he set up an app for us to use)
	var url = 'https://simple-weather.p.mashape.com/weatherdata?lat=' + lat + '&lng=' + lon;
	xhr.open('GET', url);
	xhr.setRequestHeader('X-Mashape-Key', 'TOknjtGzdemshrzgusLGkS3AeiMqp1wfg0GjsnFEjsB1iuGO11');
	xhr.setRequestHeader('Accept', 'application/json');
	xhr.onload = function() {
		var json = JSON.parse(this.responseText);
		if (!json) {
			alert('An invalid response from the simple-weather API!');
			return;
		}
		
		// TODO: Add try catch

		// if there are two links concatenated by *, get the second one
		var link = json.query.results.channel.item.link;
		link = link.split('*');
		link = link[ link.length - 1 ];

		// Populates GeoInfo with the location data collected from Google Maps
		GeoInfo = new GeoData(location_name, lat, lon, link);
		callback();
	};	// end onload() fn.
	// Something went wrong fetching location info. Bail out!
	xhr.onerror = function(e) {
		Ti.API.error(e.error);
		alert(ERROR_MESSAGE);
	};
	// sends the AJAX RESTful web service request
	xhr.send();
};

var forwardGeocodeWeb = function(address, callback) {
	var geocoder = new google.maps.Geocoder();
	if (geocoder) {
		geocoder.geocode({
			'address' : address
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				callback(new GeoData(address, results[0].geometry.location.lat(), results[0].geometry.location.lng()), null);
			} else {
				Ti.API.error(status);
				alert(ERROR_MESSAGE);
			}
		});
	} else {
		alert('Google Maps Geocoder not supported');
	}
};
