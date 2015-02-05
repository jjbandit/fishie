Meteor.methods({
addLessonToInstr: function(instrID, lessonObj) {
	// update the instructor
	console.log(instrID);
	Instructors.update(
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
	Lessons.upsert(lessonObj._id, {$set: {instructor: instrID}});
}
});
