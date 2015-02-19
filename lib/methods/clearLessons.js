Meteor.methods({

clearLessons: function(lessonIDs) {
	console.log('clearing');
	lessonIDsLength = lessonIDs.length;
	for (var i = 0; i < lessonIDsLength; i++) {
		var lessonID = lessonIDs[i];
		var lesson = Lessons.findOne(lessonID, {owner: Meteor.userId()});
		var lessonTimes = lesson.lessonTimes;
		Instructors.update(lesson.instructor, {$pull: {lessonList: lessonID}, $pullAll: {lessonTimes: lessonTimes}});
	// cleanup Instructor if it has no lessons
		var instr = Instructors.findOne(lesson.instructor, {owner: Meteor.userId()});
		if (instr.lessonList.length == 0) {
			Instructors.remove(lesson.instructor);
		}
		Lessons.remove(lessonID, {owner: Meteor.userId()});
	};
},

// This shoudl loop thorugh a Lessons.find cursor
	clearAllLessons: function() {
		Lessons.remove({});
	}

});
