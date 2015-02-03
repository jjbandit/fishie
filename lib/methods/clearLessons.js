Meteor.methods({

clearLesson: function(lessonID) {
	var lesson = Lessons.findOne(lessonID);
	var lessonTime = lesson.lessonTime;
	Instructors.update(lesson.instructor, {$pull: {lessonList: lessonID}, $pullAll: {lessonTimes: lessonTime}});
	// cleanup Instructor if it has no lessons
	i = Instructors.findOne(lesson.instructor);
	if (i.lessonList.length == 0) {
		Instructors.remove(lesson.instructor);
	}
	Lessons.remove(lessonID);
},

	clearAllLessons: function() {
		Lessons.remove({});
	}

});
