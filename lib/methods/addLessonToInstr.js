Meteor.methods({
	addLessonToInstr: function(instrID, lessonObj, setID) {
		// check if there's an instructor already in the lessons instructor field
		// and pull the lessonID from that instructor if there is
		if (lessonObj.instructor) {
			var oldInstrID = lessonObj.instructor;
			Instructors.update(
				oldInstrID, {
					$pullAll: {
						lessonList: [lessonObj._id],
						lessonTimes: lessonObj.lessonTimes
					}
				}
			);
		}
		// then update the Lessons instructor to the new ID
		lessonObj.instructor = instrID;
		Lessons.upsert(lessonObj._id, lessonObj);

		// Sort lesson times
		var instrObj = Instructors.findOne(instrID);
		var sortedLessonTimes = lessonObj.lessonTimes;
		if (instrObj) {
			sortedLessonTimes = _.union(instrObj.lessonTimes, sortedLessonTimes);
			sortedLessonTimes = Fishie.sortDateArray(sortedLessonTimes);
		}

		// and update the new instructor
		var createDate = new Date();
		Instructors.upsert(
			instrID, {
				$setOnInsert: {
					createdAt: createDate,
					owner: Meteor.userId(),
					set: setID
				},
				$set: {
				lessonTimes: sortedLessonTimes,
				},
				$set: {
					weekdays: lessonObj.weekdays,
				},
				$push: {
				lessonList: lessonObj._id,
				}
			}
		);
	}
});
