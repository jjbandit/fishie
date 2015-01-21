Template.body.helpers ({

	instructor: function() {
		// find the number of instructors
		var maxInstrCursor = Lessons.findOne({},{sort: {instructor: -1}});
		// check if there are any
		if (maxInstrCursor) {

			// push values into an array for each instructor
			// this array gets looped over again and renders classes
			// for each index it contains
			var numInstrs = maxInstrCursor.instructor;
			var instrArray = [];
			for (var i = 1; i <= numInstrs; i++) {
				instrArray.push(i);
			};
			return instrArray;
		}
	},
	lessons: function(instr) {
		// render lessons for each index (instructor) in the array built by the instructor helper
		return Lessons.find({instructor: instr}, {sort: {startTime: 1}});
	},

	breakBlock: function(lesson) {

		//FIXME Collection is possibly not ready before this fires.
		prevLesson = Lessons.findOne({instructor: lesson.instructor, endTime: {$lt: lesson.startTime}, _id: {$ne: lesson._id}}, {sort: {startTime: -1}});

	// get 15 minute blocks between the two lessons
	if (prevLesson) {
		var timeSpan = lesson.startTime.getTime() - prevLesson.endTime.getTime();
	}	else {
		var firstTime = Lessons.findOne({}, {sort: {startTime: 1}}).startTime;
		var timeSpan = lesson.startTime.getTime() - firstTime;
	}

		// returns one block per 15 minute increment
		var timeBlocks = (Math.round(timeSpan / 60000) + 1) / 15;

		var timeAry = [];

		// return an array with one index for each block between lessons
		for (var i = 1; i <= timeBlocks; i++) {
			var blockTime = new Date();
			timeAry.push(i);
		};

		return timeAry;

	},
});

Template.body.events ({
	'click .clear' : function() {
		if (confirm('Clear all lessons?')) {
			Meteor.call("clearAllLessons");
		}
	}
});

