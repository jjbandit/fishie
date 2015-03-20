Meteor.methods({
	addLessonToInstr: function(instrIdOrObj, lessonObj, setID) {
		// Ensure we're dealing with an instructor object
		// instrID is a mandatory variable for this method
		if (typeof instrIdOrObj === 'string') {
			var instrID = instrIdOrObj;
		} else {
			var instrObj = instrIdOrObj;
			var instrID = instrObj._id;
		}

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
		// Initialize the sorted list to the lessonObjs lessonTimes for the case that
		// we're creating the instructor
		var sortedLessonTimes = lessonObj.lessonTimes;
		if (instrObj) {
			// If the instructor is created then build an array of the instructors current lessons
			// and the new lessons times, then sort it
			var lessonTimes = lessonObj.lessonTimes;
			var totalLessonTimes = _.union(instrObj.lessonTimes, lessonTimes);
			sortedLessonTimes = Fishie.sortDateArray(totalLessonTimes);
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
					weekdays: lessonObj.weekdays,
					lessonTimes: sortedLessonTimes
				},
				$push: {
					lessonList: lessonObj._id
				}
			}
		);
	}
});
