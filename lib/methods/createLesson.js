Meteor.methods ({
	createLesson: function(lessonIdOrObj ,instrId, setId, level, weekdays, startTime, length, swimmers, privateLesson) {

		// TODO VALIDATE WEEKDAY ARRAY
		// Validation
		// FIXME We should use a local variable thats passed between methods so it doesn't pollute global space
		excludeIDs = [];


		// If we get a lesson Id passed in, validate the rest of the arguments
		if (typeof lessonIdOrObj === 'string') {
			check(level, Match.Integer);
			check(startTime, Date);
			check(length, Match.Integer);
			check(swimmers, Match.Integer);
			check(setId, String);
			check(instrId, String);
			check(lessonIdOrObj, String);
			// Set the end time to the start time + the length of the lesson
			var lessonObj = Fishie.parseLessonObject(lessonIdOrObj, setId, level, privateLesson, swimmers, weekdays, startTime, length);
			lessonId = lessonIdOrObj;

		// Otherwise extract some values we're going to be working with from the object
		} else if (typeof lessonIdOrObj == 'object') {
			lessonObj = lessonIdOrObj;
			var setId = lessonObj.setId;
			var lessonId = lessonObj._id;
			var instrId = new Meteor.Collection.ObjectID()._str;
			lessonObj.instructor = instrId;
		}

		// Deny 0 participant lessons the chance to split
		if (lessonObj.swimmers <= 0) {
			Fishie.scheduleLesson(lessonObj, setId, instrId);
			return;
		}

		// End init + start splitting algo
		var epUp = Fishie.optimizeSplits([lessonObj], lessonObj.levels, 1);
		var epDn = Fishie.optimizeSplits([lessonObj], lessonObj.levels, -1);
		var shortPath;
		var longPath;
		if (!epUp && !epDn) {
			// If we didn't find a path to split with insert a new lesson
			// Find or create an instructor for the lesson
			Fishie.scheduleLesson(lessonObj, setId, instrId);
			return;
			// Otherwise.. this.. monstrosity
		} else if (!epUp && epDn) {
			shortPath = epDn;
		} else if (epUp && !epDn) {
			shortPath = epUp;
		} else if (epUp && epDn) {
			if (epUp.length > epDn.length) {
				shortPath = epDn;
				longPath = epUp;
			} else {
				shortPath = epUp;
				longPath = epDn;
			}
		}
		// Try to condense the shortest path, if it fails for any reason
		// try and condense the longer path. If both condense attempts fail
		// then create a new lesson.
		if (shortPath) {
			var condensed = false;
			condensed = Fishie.condenseLessons(shortPath, lessonId);

			if (!condensed) {
				condensed = Fishie.condenseLessons(longPath, lessonId);
			}
			// FIXME THIS IS MAKING THINGS RENDER TWO TIMES FOR SOME REASON
			if (!condensed) {
				// If we didn't find a path to split with insert a new lesson
				Fishie.scheduleLesson(lessonObj, setId, instrId);
			}
		}
	}
});
