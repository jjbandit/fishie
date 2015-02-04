Template.lessonControls.events ({
	'click .clear-lesson': function(attribute) {
		Meteor.call('clearLesson', this._id);
	},
	'mousedown #lesson-controls': function() {
		console.log(this);
		console.log(event);
		// set a session variable that gets checked in the body mouseup template.events
		// so the user doesn't have to mouseup over the lesson-controls div
		Session.set('dragging', true);
		$('#schedule').append('<div class="ghost-lesson">Test!</div>');
	},
	'mouseup #lesson-controls': function() {
		$('div').remove('.ghost-lesson');
	},
});
