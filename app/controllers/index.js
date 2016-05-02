/*
 To run this demo app on Android, you must obtain a Google Maps API v2 key
 from the Google API console and update your tiapp.xml file.
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
if (Ti.Platform.osname === 'android') {//check if the google services are available and up to date, otherwise App will crash on Android
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
	} else	//everythings fine, lets launch the app
		startApp();
} else {
	startApp();
}



function startApp() {
	$.addAddress.on('addAnnotation', function(e) {
		$.map.addAnnotation(e.geodata, e.weather);
	});
	
	$.index.open();
}
