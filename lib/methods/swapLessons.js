Meteor.methods({
	swapLessons: function(swapLesson, lessonList) {
		console.log(lessonList);
		// TODO This method should expect an object an an array of lessons to swap the
		// object with, currently broken
		var allLessonIDs = [];
		var allLessonTimes = [];
		var allInstructorIDs = [];
		var secondInstr = lessonList[0].instructor;

		var lessonListLength = lessonList.length;
		for (var i = 0; i < lessonListLength; i++) {
			allLessonIDs.push(lessonList[i]._id);
			allLessonTimes.push(lessonList[i].lessonTimes);
		};
		// Add the swapLesson to stuff
		allLessonIDs = _.union([swapLesson._id], allLessonIDs);
		// have to flatten because lessonTimes property is an array
		allLessonTimes = _.flatten(_.union(swapLesson.lessonTimes, allLessonTimes));
		allInstructorIDs = _.union([swapLesson.instructor], [lessonList[0].instructor]);
		// console.log(allLessonIDs);
		// console.log(allLessonTimes);
		// console.log(allInstructorIDs);

		// Pull all lesson data from instructors in prep. to re-insert
		Instructors.update(
			{
				_id: {
					$in: allInstructorIDs
				}
			},
			{
				$pullAll: {
					lessonList: allLessonIDs,
					lessonTimes: allLessonTimes
				}
			},
			{
				multi: true
			}
		);
		for (var i = 0; i < lessonListLength; i++) {
			// set the lessons instructor to nul so we don't pull
			// lesson times when we re-assign the lessons
			lessonList[i].instructor = '';
			Fishie.addLessonToInstr(swapLesson.instructor, lessonList[i]);
		};
		swapLesson.instructor = '';
		Fishie.addLessonToInstr(secondInstr, swapLesson);
	}
});
