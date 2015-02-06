Meteor.methods({

clearLessons: function(lessonIDs) {
	lessonIDsLength = lessonIDs.length;
	for (var i = 0; i < lessonIDsLength; i++) {
		var lessonID = lessonIDs[i];
		var lesson = Lessons.findOne(lessonID);
		console.log(lesson);
		var lessonTimes = lesson.lessonTimes;
		Instructors.update(lesson.instructor, {$pull: {lessonList: lessonID}, $pullAll: {lessonTimes: lessonTimes}});
	// cleanup Instructor if it has no lessons
		var instr = Instructors.findOne(lesson.instructor);
		if (instr.lessonList.length == 0) {
			Instructors.remove(lesson.instructor);
		}
		Lessons.remove(lessonID);
	};
},

	clearAllLessons: function() {
		Lessons.remove({});
	}

});
