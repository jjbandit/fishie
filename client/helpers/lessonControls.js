Template.lessonControls.events ({
	'mousedown .clear-lesson': function(attribute) {
		Meteor.call('clearLessons', [this._id]);
	},
});
