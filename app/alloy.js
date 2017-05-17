var geo = require('geo');

Alloy.Globals.LATITUDE_BASE = 43.0440;
Alloy.Globals.LONGITUDE_BASE = -87.9084;

if (OS_IOS || OS_ANDROID) {
	Alloy.Globals.Map = Ti.Map = require('ti.map');
	Alloy.Collections.location = Alloy.createCollection('location');
	Alloy.Globals.top = 0;
	Alloy.Globals.tableTop = '70dp';	// offset for locations list screen (=) button
}
Alloy.Globals.winTop = (OS_IOS && parseInt(Ti.Platform.version, 10) >= 7) ? 20 : 0;
Ti.UI.backgroundColor = "#fff";
