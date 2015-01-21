Template.selectorButtons.events ({
	'click .clear' : function() {
		if (confirm('Clear all lessons?')) {
			Meteor.call("clearAllLessons");
		}
	}
});

