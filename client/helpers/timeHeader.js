Template.timeHeader.helpers({
	timeBlock: function() {
		var firstLesson = Lessons.findOne({}, {sort: {lessonTime: 1}});
		var lastLesson = Lessons.findOne({}, {sort: {lessonTime: -1}});
		if (firstLesson) {
			console.log(firstLesson.lessonTime[0]);
			console.log(lastLesson.lessonTime[lastLesson.lessonTime.length - 1]);
		}
	},
});
