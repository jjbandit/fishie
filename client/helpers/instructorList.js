Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find();
	},
	sortedLessonList: function(lessonID_ary) {
		lessonCursor = Lessons.find({_id: {$in: lessonID_ary}}, {sort: {lessonTime: 1}});
		return lessonCursor;
	},
	getBreaks: function(lessonObj) {
		var undefined;
		lastLesson = Lessons.findOne( {
			instructor: lessonObj.instructor,
			lessonTime: {$lt: lessonObj.lessonTime[0]},
		}, {sort: {lessonTime: -1}} );
		if (lastLesson != undefined) {
			var blocks = Fishie.getTimeBlocks(lastLesson.lessonTime[lastLesson.lessonTime.length - 1], lessonObj.lessonTime[0]);
		}
		return blocks;
		// console.log(lessonObj);
		// console.log(lastLesson);
		// console.log('============');
	}
});
