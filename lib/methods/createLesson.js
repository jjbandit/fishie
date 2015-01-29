Meteor.methods ({
	createLesson: function(lessonID, level, weekdays, startTime, length, swimmers, privateLesson) {
		// TODO VALIDATE WEEKDAY ARRAY
		// Validation
		// FIXME THIS HACK NEEDS TO BE REVISITED
		// FIXME We should use a local variable thats passed between methods so it doesn't pollute global space
		// reset the global exclude variable so I dont have to fuck around in the loop
		excludeIDs = [];
		direction = 1;
		// this
		check(level, Match.Integer);
		check(startTime, Date);
		check(length, Match.Integer);
		check(swimmers, Match.Integer);
		check(lessonID, Meteor.Collection.ObjectID);
		// Convert the ID object to a string so it parses correctly on insert
		var lessonID_str = lessonID._str;
		// Set the end time to the start time + the length of the lesson
		var endTime = new Date(startTime.toJSON());
		endTime.setMinutes(startTime.getMinutes() + length);
		var lessonTime = Fishie.getTimeBlocks(startTime, endTime, weekdays);
		var maxSwimmers = Fishie.getSplitSwimmers(level);
		lessonObj = Fishie.parseLessonObject(lessonID_str, level, privateLesson, swimmers, maxSwimmers, lessonTime, length);
		console.log('lessonObj');
		console.log(lessonObj);
		// End init + start splitting algo
		var splitCandidates = Fishie.getSplitCandidates(lessonTime, level, swimmers, maxSwimmers);
		var trimmedSplit = [];
		console.log('splitCandidates');
		console.log(splitCandidates);
		// FIXME HACK ALERT!!~~~~~~~~~~~
		var path = [];
		var f = Fishie.optimizeSplits(splitCandidates, path);
		console.log('opt finished');
		console.log(f);
		if (splitCandidates.length > 0) {
			trimmedSplit = Fishie.trimSplits(splitCandidates);
		}
		if (trimmedSplit.length > 0) {
			console.log('trimmedSplit');
			console.log(trimmedSplit);
			Lessons.update(trimmedSplit[0]._id, {$push: {levels: level, swimmers: swimmers}});
		} else {
			Lessons.insert (
				lessonObj
			);
			// Find or create an instructor for the lesson
			Fishie.scheduleLesson(lessonID_str);
		}
	},
});
