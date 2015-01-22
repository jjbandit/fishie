Meteor.methods ({

	createClass: function(level, startTime, length, swimmers, privateClass) {
		// Validation
		check(level, Match.Integer);
		check(startTime, Date);
		check(length, Match.Integer);
		check(swimmers, Match.Integer);
		// initialize lessonID
		var lessonID = new Meteor.Collection.ObjectID();
		// Convert the ID object to a string
		// so it parses correctly
		strLessonID = lessonID._str;
		// Set the end time to the start time + the length of the class
		var endTime = new Date(startTime.toJSON());
		endTime.setMinutes(startTime.getMinutes() + length);
		// Check what level and set the class type
		var classType = 'Swim Kids';
		if (level > 10) {
			classType = 'Preschool';
			level = level -10;
		}
		var lessonTime = Fishie.getTimeBlocks(startTime, endTime);
		console.log(lessonTime);

		var instructor = Fishie.searchForInstructor(lessonID);
		Lessons.insert ({
			level: level,
			privateClass: privateClass,
			classType: classType,
			split: false,
			instructor: instructor,
			swimmers: swimmers,
			lessonTime: lessonTime,
			length: length,
			_id: strLessonID,
		});
	},
	createInstructor: function() {
		Instructors.insert({
			lessons: [],
		});
	},
});
