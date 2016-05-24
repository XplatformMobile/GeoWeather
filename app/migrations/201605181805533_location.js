migration.up = function(migrator) {
	migrator.createTable({
		columns: {
		    "locationName": "string",
		    "latitude": "string",
		    "longitude": "string",
		    "temperature": "string",
		    "units": "string",
		    "description": "string"
		}
	});
};

migration.down = function(migrator) {
	migrator.dropTable("location");
};
