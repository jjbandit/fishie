Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find();
	},
	sortedLessonList: function(lessonID_ary) {
		lessonCursor = Lessons.find({_id: {$in: lessonID_ary}}, {sort: {lessonTime: 1}});
		return lessonCursor;
	},
});
