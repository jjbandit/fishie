Template.lessonControls.events ({
	'click .delete-lesson-input' : function() {
		Meteor.call('clearLesson', this._id);
	},
	'click .break-split-lesson-input': function() {
		Meteor.call('breakSplitLesson', this._id);
	},

	'click .change-lesson-instructor' : function(lessonID) {
		// this depends on the text input being immedietly before the button in the DOM
		var newInstr = parseInt($(event.target.previousElementSibling, '#swim-class').val());
		console.log(newInstr);

		Meteor.call('updateLessonInstr', this._id, newInstr);

	},

});
