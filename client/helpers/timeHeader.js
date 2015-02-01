Template.timeHeader.helpers({
	timeBlock: function() {
		var firstLesson = Lessons.findOne({}, {sort: {lessonTime: 1}});
		var lastLesson = Lessons.findOne({}, {sort: {lessonTime: -1}});
		if (firstLesson) {
			var firstTime = new Date(firstLesson.lessonTime[0]);
			var lastTime = new Date(lastLesson.lessonTime[lastLesson.lessonTime.length - 1]);
			return blocks = Fishie.getTimeBlocks(firstTime, lastTime);
		}
	},
});
