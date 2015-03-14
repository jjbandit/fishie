Template.home.events ({

	// Handle the New Set input
	'click input#new-set': function () {

		// Check for time builder template and return out if it's there
		if ( $('.builder').get().length > 0 ) { return; }

		// Otherwise render the template as a child of body
		var body = $('body').get();
		var v = Blaze.render(Template.buildSet, body[0] );
	},

	'click input#select-set' : function() {
		console.log("otherclick");
	}
});
