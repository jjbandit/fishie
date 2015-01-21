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
	}
});
