Template.lessonControls.events ({
	'click .clear-lesson': function(attribute) {
		Meteor.call('clearLesson', this._id);
	},
});
