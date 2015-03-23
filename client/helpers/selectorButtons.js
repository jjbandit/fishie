Template.selectorButtons.events ({
	'click .clear-lessons' : function() {
		var setID = Router.current().params._id;
		if (confirm('Clear all lessons?')) {
			Meteor.call("clearAllLessons", setID);
		}
	}
});

