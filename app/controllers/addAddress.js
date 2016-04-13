var geo = require('geo');

$.button.addEventListener('click', function(e) {
	$.textField.blur();
	geo.forwardGeocode($.textField.value, function(geodata, weather) {
		$.trigger('addAnnotation', {
			geodata : geodata,
			weather : weather
		});
	});
});
