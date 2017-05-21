exports.definition = {
	config : {
		columns : {
			"locationName" : "string",
			"latitude" : "string",
			"longitude" : "string",
			"temperature" : "string",
			"units" : "string",
			"description" : "string",
			"city_id" : "string"	// this was added by JJB
		},
		adapter : {
			type : "sql",
			collection_name : "location"
		}
	},
	extendModel : function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection : function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here

			// For Backbone v1.1.2, uncomment the following to override the
			// fetch method to account for a breaking change in Backbone.
			 fetch: function(options) {
			 	options = options ? _.clone(options) : {};
			 	options.reset = true;
			 	return Backbone.Collection.prototype.fetch.call(this, options);
			 }
		});

		return Collection;
	}
}; 