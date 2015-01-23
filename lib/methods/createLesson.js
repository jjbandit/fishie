Meteor.methods ({
	createLesson: function(lessonID, level, startTime, length, swimmers, privateLesson) {
		// Validation
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
		// Check what level and set the lesson type
		var lessonType = 'Swim Kids';
		if (level > 10) {
			lessonType = 'Preschool';
			level = level -10;
		}
		// Returns an array with an index for each 15 minute block the lesson spans
		var lessonTime = Fishie.getTimeBlocks(startTime, endTime);
		Lessons.insert ({
			_id: lessonID_str,
			level: level,
			privateLesson: privateLesson,
			lessonType: lessonType,
			split: false,
			instructor: '',
			swimmers: swimmers,
			lessonTime: lessonTime,
			length: length,
		});
		// Find or create an instructor for the lesson
		Fishie.scheduleLesson(lessonID_str);
	},
});
