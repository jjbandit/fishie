Template.lessonControls.events ({
	'click .clear-lesson': function(attribute) {
		console.log('yay');
		Meteor.call('clearLesson', this._id);
	},
});
