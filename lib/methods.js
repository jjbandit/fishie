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

		// TODO
		// This splits classes based on the order they are created and not based on optimal class sizes
		// it should take into account all possible splits and choose to maximize participants

		// Check if there are classes within 1 level that coincide with the proposed class and if there are
		// check number of participants.  Split it and return from the method if there are

		//  Return a cursor containing any candidates for a split
		//  not sure if the AND is nessicary because of mongos implied and, but it works.

		splitCursor = Lessons.find({
			$and : [
				{ startTime: startTime },
				{ classType: classType },
				{ privateClass: {$ne: 1}},
				{ endTime: endTime },
				{ $or : [
					{ level: level + 1 },{ level: level - 1 }
				] },
			]
		});

		var splitArray = splitCursor.fetch();

		// Determine the max number of swimmers for the new lessons level
		var maxSwimmers = 0;

		// Several breakpoints for SK lessons
		if (level < 5) {
			maxSwimmers = 6;

		} else if (level < 7) {
			maxSwimmers = 8;

		} else {
			maxSwimmers = 10;
		}

		// Preschool lessons cap out at 5
		if (level > 10) {
			maxSwimmers = 5;
		}

		// loop through candidates for a split
		for (var i = 0; i < splitCursor.count(); i++) {

			// if we find one where both swimmers properties add to less than the breakpoint
			if (splitArray[i].swimmers + swimmers <= maxSwimmers) {
				Lessons.update(splitArray[i]._id, {$set: {split: true}});

				// Logic to set the smaller level into the first array index
				// so it looks nicer when it gets rendered
				if (splitArray[i].level > level) {
					bigLevel = splitArray[i].level;
					bigSwimmers = splitArray[i].swimmers;
					smallLevel = level;
					smallSwimmers = swimmers;
				} else {
					bigLevel = level;
					bigSwimmers = swimmers;
					smallLevel = splitArray[i].level;
					smallSwimmers = splitArray[i].swimmers;
				}
				Lessons.update(splitArray[i]._id, {$set: {level: [smallLevel, bigLevel]}});
				Lessons.update(splitArray[i]._id, {$set: {swimmers: [smallSwimmers, bigSwimmers]}});
				return;
			}
		};

		// if the split-class logic didn't hit a return insert a new Lesson record
		Lessons.insert ({
			level: level,
			privateClass: privateClass,
			classType: classType,
			split: false,
			instructor: 0,
			swimmers: swimmers,
			startTime: startTime,
			length: length,
			endTime: endTime,
			_id: strLessonID,
		});

		// and sort it
		Meteor.call('sortNewClass', lessonID);
	},

	sortNewClass: function(newLessonID) {

		var newLessonID_str = newLessonID._str;
		var newLesson_obj = Lessons.findOne({_id: newLessonID_str});

		var nst = newLesson_obj.startTime;
		var net = newLesson_obj.endTime;

		// return the number of instructors by sorting by instructor # and returning the first one
		var numInstructors = Lessons.findOne({},{sort: {instructor: -1}}).instructor;
		// returns a cursor containing all classes that conflict with the new one
		// NOTE when I expose this as a global variable and call conflictCursor the new lesson is included, however the
		// console.log proceeding this does not return the new lesson.  Weird.  Not sure why, but the _id exclusion
		// is working as written/intended
		var conflictCursor = Lessons.find({ startTime:  {$lte: net}, _id: {$ne: newLessonID_str}, endTime: {$gte: nst} });
		// console.log(conflictCursor);

		var conflictInstrs = [];
		var conflictObjs = conflictCursor.fetch();

		conflictObjs.forEach(function(lsn) {
			conflictInstrs.push(lsn.instructor);
		});

		// search from 1 until the total number of instructors + 1 (in the case there is not a free block) until we find
		// an available instructor.
		// If the loop gets to numInstructors + 1 that means there are no spots available and adds a new instructor
		for (var i = 1; i <= numInstructors + 1; i++) {
			if (conflictInstrs.indexOf(i) == -1) {
				Lessons.update(newLessonID_str, {$set: {instructor: i}});
				break;
			}
		};
	},

	updateLessonInstr: function(lessonID, newInstr) {

		check(lessonID, String);
		check(newInstr, Match.Integer);

		var lesson_obj = Lessons.findOne(lessonID);

		var swapLesson = Lessons.findOne( {_id: {$ne: lessonID}, startTime: lesson_obj.startTime, endTime: lesson_obj.endTime, instructor: newInstr});

		if (swapLesson) {
			var swapLessonInstructor = swapLesson.instructor;
			var lesson_objInstructor = lesson_obj.instructor;

			Lessons.update({_id: lessonID}, {$set: {instructor: swapLessonInstructor}} );
			Lessons.update({_id: swapLesson._id}, {$set: {instructor: lesson_objInstructor}} );
		}

		Lessons.update(lessonID, {$set: {instructor: newInstr}});
	},

	clearLesson: function(lessonID) {
		Lessons.remove(lessonID);
		// FIXME
		// It is possible for this behavior to leave an empty instructor by removing all
		// classes mapped to that instructor.
		// TODO Write a loop that checks for empty instructors and bumps all proceeding classes
		// down one instructor
	},

	clearAllLessons: function() {
		Lessons.remove({});
	}

});
