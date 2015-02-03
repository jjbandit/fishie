Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find();
	},
	sortedLessonList: function(lessonID_ary) {
		lessonCursor = Lessons.find({_id: {$in: lessonID_ary}}, {sort: {lessonTime: 1}});
		return lessonCursor;
	},
	getBreaks: function(lessonObj) {
		prevLesson = Lessons.findOne( {
			instructor: lessonObj.instructor,
			lessonTime: {$lt: lessonObj.lessonTime[0]},
		}, {sort: {lessonTime: -1}} );
		if (prevLesson !== undefined) {
			var blocks = Fishie.getTimeBlocks(prevLesson.endTime(), lessonObj.lessonTime[0]);
		}
		// console.log(blocks);
		return blocks;
		// console.log(lessonObj);
		// console.log(lastLesson);
		// console.log('============');
	}
});
