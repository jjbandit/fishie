Meteor.methods({

	updateLessonInstr: function(lessonID, newInstr) {

		check(lessonID, String);
		check(newInstr, Match.Integer);

		var lesson_obj = Lessons.findOne(lessonID);

		var swapLesson = Lessons.findOne( {_id: {$ne: lessonID}, startTime: lesson_obj.startTime, endTime: lesson_obj.endTime, instructor: newInstr});

		if (swapLesson) {
			var swapLessonInstructor = swapLesson.instructor;
			var lesson_objInstructor = lesson_obj.instructor;

			Lessons.update({_id: lessonID}, {$set: {instructor: swapLessonInstructor}} );
			Lessons.update({_id: swapLesson._id}, {$set: {instructor: lesson_objInstructor}} );
		}

		Lessons.update(lessonID, {$set: {instructor: newInstr}});
	},
});
