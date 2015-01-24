Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find();
	},
<<<<<<< HEAD
	renderBreaks: function(lessonID) {
		console.log(Lessons.findOne(lessonID));
		lessonObj = Lessons.findOne(lessonID);
=======
	sortedLessonList: function(lessonID_ary) {
		lessonCursor = Lessons.find({_id: {$in: lessonID_ary}}, {sort: {lessonTime: 1}});
		return lessonCursor;
>>>>>>> temp
	},
});
