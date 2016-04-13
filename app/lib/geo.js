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
var prevLat = 37.389569;
var prevLon = -122.050212;

var GeoData = function(title, latitude, longitude, zip) {
	this.title = title;
	this.coords = {
		latitude : latitude,
		longitude : longitude
	};
	this.zip = zip;
};

/**
 * !!!!!!!DEPRECATED!!!!!!!!
 * Delays the callback function, creates a weather JS Object that contains all relevant information about current information.
 * @param {Object} zip
 * @param {Object} callback
 * @param {Object} iteration - set always to 0. Internal handling.
 */
var buildWeatherRequestByZip = function(zip, callback, iteration) {
	var uac = IDs[iteration];
	var request = "http://www.myweather2.com/developer/forecast.ashx?uac=" + uac + "&output=json&query=" + zip + "&temp_unit=f&ws_unit=mph";
	// JSON EXAMPLE:
	//{ "weather": { "curren_weather": [ {"humidity": "58", "pressure": "1032", "temp": "11", "temp_unit": "c", "weather_code": "1", "weather_text": "Partly cloudy",  "wind": [ {"dir": "E", "speed": "3", "wind_unit": "kph" } ] } ],  "forecast": [ {"date": "2015-04-20",  "day": [ {"weather_code": "3", "weather_text": "Overcast skies",  "wind": [ {"dir": "ENE", "dir_degree": "73", "speed": "22", "wind_unit": "kph" } ] } ], "day_max_temp": "17",  "night": [ {"weather_code": "0", "weather_text": "Clear skies",  "wind": [ {"dir": "ENE", "dir_degree": "68", "speed": "22", "wind_unit": "kph" } ] } ], "night_min_temp": "4", "temp_unit": "c" }, {"date": "2015-04-21",  "day": [ {"weather_code": "2", "weather_text": "Cloudy skies",  "wind": [ {"dir": "ENE", "dir_degree": "57", "speed": "22", "wind_unit": "kph" } ] } ], "day_max_temp": "16",  "night": [ {"weather_code": "3", "weather_text": "Overcast skies",  "wind": [ {"dir": "ENE", "dir_degree": "66", "speed": "22", "wind_unit": "kph" } ] } ], "night_min_temp": "5", "temp_unit": "c" } ] }}
	var xhr = Titanium.Network.createHTTPClient();
	xhr.open('GET', request);
	var json;
	var text;
	xhr.onload = function() {
		text = this.responseText;
		json = JSON.parse(text);
		WeatherInfo = json;
		callback(GeoInfo, WeatherInfo);
	};

	xhr.onerror = function(e) {
		/*
		 * We might have run out of daily quota. Try another uac code to get another helping
		 */
		if (iteration < IDs.length) {
			buildWeatherRequestByCoords(lat, lon, callback, iteration + 1);
			return;
		} else {
			Ti.API.error(e.error);
			alert(ERROR_MESSAGE);
		}
	};
	xhr.send();
	return json;
};

/**
 * Delays the callback function, creates a weather JS Object that contains all relevant information about current information.
 * @param {Object} lattitude
 * @param {Object} longitude
 * @param {Object} callback
 * @param {Object} iteration - set always to 0. Internal handling.
 */
var buildWeatherRequestByCoords = function(lat, lon, callback, iteration) {
	var uac = IDs[iteration];
	var request = "http://www.myweather2.com/developer/forecast.ashx?uac=" + uac + "&output=json&query=" + lat + "," + lon + "&temp_unit=f&ws_unit=mph";
	// JSON EXAMPLE:
	//{ "weather": { "curren_weather": [ {"humidity": "58", "pressure": "1032", "temp": "11", "temp_unit": "c", "weather_code": "1", "weather_text": "Partly cloudy",  "wind": [ {"dir": "E", "speed": "3", "wind_unit": "kph" } ] } ],  "forecast": [ {"date": "2015-04-20",  "day": [ {"weather_code": "3", "weather_text": "Overcast skies",  "wind": [ {"dir": "ENE", "dir_degree": "73", "speed": "22", "wind_unit": "kph" } ] } ], "day_max_temp": "17",  "night": [ {"weather_code": "0", "weather_text": "Clear skies",  "wind": [ {"dir": "ENE", "dir_degree": "68", "speed": "22", "wind_unit": "kph" } ] } ], "night_min_temp": "4", "temp_unit": "c" }, {"date": "2015-04-21",  "day": [ {"weather_code": "2", "weather_text": "Cloudy skies",  "wind": [ {"dir": "ENE", "dir_degree": "57", "speed": "22", "wind_unit": "kph" } ] } ], "day_max_temp": "16",  "night": [ {"weather_code": "3", "weather_text": "Overcast skies",  "wind": [ {"dir": "ENE", "dir_degree": "66", "speed": "22", "wind_unit": "kph" } ] } ], "night_min_temp": "5", "temp_unit": "c" } ] }}
	var xhr = Titanium.Network.createHTTPClient();
	xhr.open('GET', request);
	var json;
	var text;
	xhr.onload = function() {
		text = this.responseText;
		json = JSON.parse(text);
		WeatherInfo = json;
		callback(GeoInfo, WeatherInfo);
	};

	xhr.onerror = function(e) {
		/*
		 * We might have run out of daily quota. Try another uac code to get another helping
		 */
		if (iteration < IDs.length) {
			buildWeatherRequestByCoords(lat, lon, callback, iteration + 1);
			return;
		} else {
			Ti.API.error(e.error);
			alert(ERROR_MESSAGE);
		}
	};
	xhr.send();
	return json;
};

exports.forwardGeocode = function(address, callback) {
	if (Ti.Platform.osname === 'mobileweb') {
		forwardGeocodeWeb(address, callback);
	} else {
		forwardGeocodeNative(address, callback);
	}
};

/**
 * No longer callbacks itself, instead creates the address and delegates the callback to the getWeather method
 * @param {Object} address
 * @param {Object} callback
 */
var forwardGeocodeNative = function(address, callback) {
	//alert("\"" + address + "\"");
	var xhr = Titanium.Network.createHTTPClient();
	var url = GOOGLE_BASE_URL + address.replace(' ', '+');
	url += "&sensor=" + (Titanium.Geolocation.locationServicesEnabled == true);

	xhr.open('GET', url);
	xhr.onload = function() {
		var json = JSON.parse(this.responseText);
		if (json.status != 'OK') {
			alert('Unable to geocode the address');
			return;
		}

		var addressComponents = json.results[0].address_components;
		var zipcode = null;
		for (var i = 0; i < addressComponents.length; i++) { //try to get zip code
			if (addressComponents[i].types == "postal_code")
				zipcode = addressComponents[i].long_name;
		}
		// alert(address);
		// alert(zipcode);
		address = json.results[0].formatted_address;
		var lat = json.results[0].geometry.location.lat;
		var lon = json.results[0].geometry.location.lng;
		// Fetch location name f.e. Los Angeles
		// Think about using http://wxdata.weather.com/wxdata/search/search?where=Los%20Angeles, parsing out the ID field and adding it to http://www.weather.com/weather/today/l/USCA0638
		GeoInfo = new GeoData(address, lat, lon, zipcode);
		// if the new weather location is near the last one, ignore it and send back old WeatherInfo
		if (Math.abs(lat - prevLat) < margin && Math.abs(lon - prevLon) < margin && WeatherInfo != null) {
			alert("You are a bit close, don\'t you think?");
			callback(GeoInfo, WeatherInfo);
		} else {
			prevLat = lat;
			prevLon = lon;
			buildWeatherRequestByCoords(lat, lon, callback, 0);
		}
	};

	xhr.onerror = function(e) {
		Ti.API.error(e.error);
		alert(ERROR_MESSAGE);
	};
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
