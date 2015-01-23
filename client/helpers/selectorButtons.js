Template.selectorButtons.events ({
	'click .clear-lessons' : function() {
		if (confirm('Clear all lessons?')) {
			Meteor.call("clearAllLessons");
		}
	},
	'click .clear-instructors' : function() {
		if (confirm('Clear all instructors?')) {
			Meteor.call("clearAllInstructors");
		}
	},
});

