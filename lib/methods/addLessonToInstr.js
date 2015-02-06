Meteor.methods({
addLessonToInstr: function(instrID, lessonObj) {
	// start by inserting the lesson
	lessonObj.instructor = instrID;
	Lessons.insert(lessonObj);
	var createDate = new Date();
	// update the instructor
	Instructors.upsert(
		instrID, {
			$setOnInsert: {createdAt: createDate},
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
