Meteor.methods({
addLessonToInstr: function(instrID, lessonObj) {
	// start by inserting the lesson
	lessonObj.instructor = instrID;
	Lessons.insert(lessonObj);
	// update the instructor
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
}
});
