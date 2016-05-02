var args = arguments[0] || {};

$.annotation.title = args.title || '';
$.annotation.subtitle = args.subtitle || '';
$.annotation.latitude = args.latitude || Alloy.Globals.LATITUDE_BASE;
$.annotation.longitude = args.longitude || Alloy.Globals.LONGITUDE_BASE;
// Image as a button (the user can click on it and be sent to a detailed view )
$.annotation.rightButton = args.rightButton || '';


