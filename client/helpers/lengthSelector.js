Template.lengthSelector.helpers ({
	getLength: function () {
		return  Session.get('Stage.length') || '30';
	},
});

Template.lengthSelector.events ({
	// Handlers that hide the radio buttons and set Sessions when they're clicked
	'click input.length-toggle' : function (event) {
		$( '#length-wrapper' ).hide();
		Session.set('Stage.length', parseInt(event.target.value) + 1);
	},
	// Handlers to expose the radio buttons when the appropriate span selector is clicked
	'click span.length' : function (event) {
		$(' #length-wrapper ' ).show();
	}
});
