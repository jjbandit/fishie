Meteor.methods({

	clearLesson: function(lessonID) {
		Lessons.remove(lessonID);
		// FIXME
		// It is possible for this behavior to leave an empty instructor by removing all
		// classes mapped to that instructor.
		// TODO Write a loop that checks for empty instructors and bumps all proceeding classes
		// down one instructor
	},

	clearAllLessons: function() {
		Lessons.remove({});
	}

});
