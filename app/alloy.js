var geo = require('geo');

Alloy.Globals.LATITUDE_BASE = 43.039918;
Alloy.Globals.LONGITUDE_BASE = -87.989755;

if (OS_IOS || OS_ANDROID) {
	Alloy.Globals.Map = Ti.Map = require('ti.map');
}
Alloy.Globals.winTop = (OS_IOS && parseInt(Ti.Platform.version, 10) >= 7) ? 20 : 0;
Ti.UI.backgroundColor = "#fff";