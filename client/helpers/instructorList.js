Template.instructorList.helpers ({
	instructors: function() {
		return Instructors.find({},{sort: {createdAt: 1}});
	},
	sortedLessonList: function(lessonID_ary) {
		// console.log(lessonID_ary);
		var lessonCursor = Lessons.find({_id: {$in: lessonID_ary}}, {sort: {lessonTimes: 1}});
		return lessonCursor;
	},
	getBreaks: function(lessonObj) {
		var lessonStartTime = lessonObj.startTime()
		var prevLesson = Lessons.findOne( {
			instructor: lessonObj.instructor,
			lessonTimes: {$lt: lessonStartTime},
		}, {sort: {lessonTimes: -1}} );
		// prevLesson returns undefined if its the instructors first scheduled lesson
		// so we should render breaks based on the first lesson
		// in the whole sets start time
		if (prevLesson === undefined) {
			var overallFirstLesson = Lessons.findOne({}, {sort: {lessonTimes: 1}});
			var blocks = Fishie.getTimeBlocks(overallFirstLesson.startTime(), lessonObj.startTime());
		} else {
			var blocks = Fishie.getTimeBlocks(prevLesson.endTime(), lessonObj.startTime());
		}
		return blocks;
	},
	trailingBreaks: function(lessonObj) {
		var nextLesson = Lessons.findOne( {
			instructor: lessonObj.instructor,
			lessonTimes: {$gt: lessonObj.endTime()},
		} );
		if (nextLesson === undefined) {
			var lastLesson = Lessons.findOne({}, {sort: {lessonTimes: -1}});
			return Fishie.getTimeBlocks(lessonObj.endTime(), lastLesson.endTime());
		}
	},
});
