Template.lessonControls.events ({
	'mousedown .clear-lesson': function(attribute) {
		console.log(this._id);
		Meteor.call('clearLessons', [this._id]);
	},
});
