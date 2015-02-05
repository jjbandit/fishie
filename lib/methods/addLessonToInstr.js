Meteor.methods({
addLessonToInstr: function(instrID, lessonObj) {
	// start by inserting the lesson
	Lessons.insert(lessonObj);
	// update the instructor
	console.log(lessonObj);
	Instructors.upsert(
		instrID, {
			$push: {
				lessonTimes: {
					$each: lessonObj.lessonTimes
				},
				lessonList: lessonObj._id,
			}
		}
	);
	// and update the class so we can search for/render breaks easily
	// Lessons.upsert(lessonObj._id, {$set: {instructor: instrID}});
}
});
