migration.up = function(migrator) {
	migrator.dropTable("location");
	migrator.createTable({
		columns: {
		    "locationName": "string",
		    "latitude": "string",
		    "longitude": "string",
		    "temperature": "string",
		    "units": "string",
		    "description": "string",
		    "city_id": "string"
		}
	});
};

migration.down = function(migrator) {
	migrator.dropTable("location");
};