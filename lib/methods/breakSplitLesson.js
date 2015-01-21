Meteor.methods({


	breakSplitLesson: function(lessonID) {
		lessonToSplit = Lessons.find(lessonID).fetch();
		// Make sure this lesson is actually a split lesson
		if (lessonToSplit.split) {
			fLsn = 0;
		
		}
	},
});
