Meteor.methods({

	sortNewClass: function(newLessonID) {

		var newLessonID_str = newLessonID._str;
		var newLesson_obj = Lessons.findOne({_id: newLessonID_str});

		var nst = newLesson_obj.startTime;
		var net = newLesson_obj.endTime;

		// return the number of instructors by sorting by instructor # and returning the first one
		var numInstructors = Lessons.findOne({},{sort: {instructor: -1}}).instructor;
		// returns a cursor containing all classes that conflict with the new one
		// NOTE when I expose this as a global variable and call conflictCursor the new lesson is included, however the
		// console.log proceeding this does not return the new lesson.  Weird.  Not sure why, but the _id exclusion
		// is working as written/intended
		var conflictCursor = Lessons.find({ startTime:  {$lte: net}, _id: {$ne: newLessonID_str}, endTime: {$gte: nst} });
		// console.log(conflictCursor);

		var conflictInstrs = [];
		var conflictObjs = conflictCursor.fetch();

		conflictObjs.forEach(function(lsn) {
			conflictInstrs.push(lsn.instructor);
		});

		// search from 1 until the total number of instructors + 1 (in the case there is not a free block) until we find
		// an available instructor.
		// If the loop gets to numInstructors + 1 that means there are no spots available and adds a new instructor
		for (var i = 1; i <= numInstructors + 1; i++) {
			if (conflictInstrs.indexOf(i) == -1) {
				Lessons.update(newLessonID_str, {$set: {instructor: i}});
				break;
			}
		};
	}
});
