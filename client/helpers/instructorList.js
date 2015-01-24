Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find();
	},
	renderBreaks: function(lessonID) {
		console.log(Lessons.findOne(lessonID));
		lessonObj = Lessons.findOne(lessonID);
	},
});
