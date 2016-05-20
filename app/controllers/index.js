/*
 To run this demo app on Android/iOS, you must obtain a Google Maps API v2 key
 from a Google API console project online and update your tiapp.xml file.
 - keys are associated with your Google developer account and the app's app ID
 - you might need to change the app ID assigned by default to this demo app

 Furthermore, you must run the app on a device (or emulator) that has the
 Google Play Services installed. The stock Android emulators do not have these
 services installed by default. You can add them. Or, run the app on a device
 that has been registered to a Google account and has Play Services installed.

 Additional information is in the documentation:
 http://docs.appcelerator.com/titanium/latest/#!/guide/Google_Maps_v2_for_Android
 */

var MapModule = require('ti.map');
if (Ti.Platform.osname === 'android')
{	// Check if the Google Play services are available and up to date,
	// otherwise App will crash on Android for sure.
	var code = MapModule.isGooglePlayServicesAvailable();
	if (code == MapModule.SUCCESS) {
		alert("Google Play Service is installed");
		startApp();
	} else if (code == MapModule.SERVICE_MISSING) {
		alert("Google Play Service not installed or missing");
	} else if (code == MapModule.SERVICE_VERSION_UPDATE_REQUIRED) {
		alert("Google Play Service requires an update");
	} else if (code == MapModule.SERVICE_INVALID) {
		alert("Google Play Service invalid");
	} else if (code == MapModule.SERVICE_DISABLED) {
		alert("Google Play Service disabled");
	} else	//everything's fine, lets launch the app
		startApp();
} else {
	startApp();	// This should work for iOS
}

// Register a function (that's called on an addAnnotation event)
// that will call the addAnnotation fn on the map object. The event
// object will hold the properties e.geodata and e.weather that are
// populated with location and weather info.
function startApp() {
	$.addAddress.on('addAnnotation', function(e) {
		$.map.addAnnotation(e.geodata, e.weather);
	});
	
	$.index.open();	// opens the top-level app window (see index.xml for more)
}
