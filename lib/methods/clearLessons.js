Meteor.methods({

clearLesson: function(lessonID) {
	var lesson = Lessons.findOne(lessonID);
	var lessonTime = lesson.lessonTime;
	console.log(lessonID);
	Instructors.update(lesson.instructor, {$pull: {lessonList: lessonID}, $pullAll: {lessonTimes: lessonTime}});
	Lessons.remove(lessonID);
},

	clearAllLessons: function() {
		Lessons.remove({});
	}

});
