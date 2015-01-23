Template.lesson.helpers ({
	getLesson: function(lessonID) {
		return Lessons.findOne(lessonID).level;
	},
});
