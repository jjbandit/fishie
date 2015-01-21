Lessons = new Mongo.Collection("lessons");

if (Meteor.isClient) {

	Template.body.helpers ({

		instructor: function() {
			// find the number of instructors
			var maxInstrCursor = Lessons.findOne({},{sort: {instructor: -1}});
			// check if there are any
			if (maxInstrCursor) {

				// push values into an array for each instructor
				// this array gets looped over again and renders classes
				// for each index it contains
				var numInstrs = maxInstrCursor.instructor;
				var instrArray = [];
				for (var i = 1; i <= numInstrs; i++) {
					instrArray.push(i);
				};
				return instrArray;
			}
		},
		lessons: function(instr) {
			// render lessons for each index (instructor) in the array built by the instructor helper
			return Lessons.find({instructor: instr}, {sort: {startTime: 1}});
		},

		breakBlock: function(lesson) {
				
			//FIXME Collection is possibly not ready before this fires.
			prevLesson = Lessons.findOne({instructor: lesson.instructor, endTime: {$lt: lesson.startTime}, _id: {$ne: lesson._id}}, {sort: {startTime: -1}});

		// get 15 minute blocks between the two lessons
		if (prevLesson) {
			var timeSpan = lesson.startTime.getTime() - prevLesson.endTime.getTime(); 
		}	else { 
			var firstTime = Lessons.findOne({}, {sort: {startTime: 1}}).startTime;
			var timeSpan = lesson.startTime.getTime() - firstTime; 
		}

			// returns one block per 15 minute increment
			var timeBlocks = (Math.round(timeSpan / 60000) + 1) / 15;

			var timeAry = [];

			// return an array with one index for each block between lessons
			for (var i = 1; i <= timeBlocks; i++) {
				var blockTime = new Date(); 
				timeAry.push(i);
			};

			return timeAry;
			
		},
	});

	Template.body.events ({
		'click .clear' : function() {
			if (confirm('Clear all lessons?')) {
				Meteor.call("clearAllLessons");
			}
		}
	});

	Template.lesson.helpers ({
		sanitizeMinutes: function(mins) {
			if (mins == 0) {
				mins = "00"
			}
			return mins;
		},
		getClassName: function(lesson) {

			// SK levels are easy to get out.
			if (lesson.classType == 'Swim Kids') {
				if (lesson.split) {
					 return lesson.classType + ' ' +lesson.level.join('/');
				} else {
					return lesson.classType + ' ' + lesson.level;
				}

			// Prechool levels need special handling
			} else if (lesson.classType == 'Preschool') {

			function getPreschoolLevel (level) {
					switch(level) {
						case 1:
							return 'Starfish';
						case 2:
							return 'Duck';
						case 3:
							return 'Sea Turtle';
						case 4:
							return 'Sea Otter';
						case 5:
							return 'Salamander';
						case 6:
							return 'Sunfish';
						case 7:
							return 'Crocodile';
						case 8:
							return 'Whale';
				};
			}

				if (lesson.split) {

					var levelAry = [];
					for (var i = 0; i < lesson.level.length; i++) {
						levelAry.push(getPreschoolLevel(lesson.level[i]));
						}
					return levelAry.join('/');
				} else {
					return getPreschoolLevel(lesson.level);
				}
			}
		},
	});
	
	Template.lesson.events ({
		'click .delete-lesson' : function() {
			Meteor.call('clearLesson', this._id);
		},

		'click .change-lesson-instructor' : function(lessonID) {
			// this depends on the text input being immedietly before the button in the DOM
			var newInstr = parseInt($(event.target.previousElementSibling, '#swim-class').val());
			console.log(newInstr);

			Meteor.call('updateLessonInstr', this._id, newInstr);

		},
	
	});
	
	Template.timeHeader.helpers ({
		getTimeBlocks: function() {
			if (Lessons.findOne({})) {
				var firstTime = Lessons.findOne({}, {sort: {startTime: 1}}).startTime;
				var lastTime = Lessons.findOne({}, {sort: {endTime: -1}}).endTime;

				var timeSpan = lastTime.getTime() - firstTime.getTime(); 

				// returns one block per 15 minute increment
				var timeBlocks = (Math.round(timeSpan / 60000) + 1) / 15;

				var timeAry = [];

				for (var i = 0; i < timeBlocks; i++) {
					var blockTime = new Date(); 

					// set the current blocks time to the time of the first class
					// plus offset it by the number of 15 minute increments we've been through
					blockTime.setTime(firstTime.getTime() + (1000 * 60 * 15 * i));

					timeAry.push(blockTime.toLocaleTimeString());
				};

				return timeAry;
			}
		},
	});
	
	Template.createClass.events ({
		'submit form' : function() {
			// Prevent form refresh
			event.preventDefault();

			// Set time for lesson
			var startTime = new Date();

			// Get values from radio buttons and convert to integers
			var hour = parseInt($('input[name=time-toggle]:checked', '#hour-wrapper').val());
			var minute = parseInt($('input[name=minute-toggle]:checked', '#minute-wrapper').val());
			var Pm = parseInt($('input[name=am-pm-toggle]:checked', '#am-pm-wrapper').val());

			// Convert PM times to 24h
			if (Pm) {
				hour=hour+12;
			};

			startTime.setHours(hour);
			startTime.setMinutes(minute);
			// Set seconds/milliseconds for sorting
			startTime.setSeconds(0);
			startTime.setMilliseconds(0);

			var level = parseInt($('input[name=level-toggle]:checked', '#level-wrapper').val());
			var length = parseInt($('input[name=length-toggle]:checked', '#length-wrapper').val());
			var swimmers = parseInt($('input[name=swimmers-toggle]:checked', '#swimmers-wrapper').val());
			var privateClass = parseInt($('input[name=private-toggle]:checked', '#private-wrapper').val());

			Meteor.call('createClass', level, startTime, length, swimmers, privateClass);
		}
	});
}

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

			console.log('swapping!');
			Lessons.update({_id: lessonID}, {$set: {instructor: swapLessonInstructor}} );
			Lessons.update({_id: swapLesson._id}, {$set: {instructor: lesson_objInstructor}} );
		
		}
		console.log(swapLesson);

		Lessons.update(lessonID, {$set: {instructor: newInstr}});
	},

	clearLesson: function(lessonID) {
		Lessons.remove(lessonID);
		//	FIXME
		//	It is possible for this behavior to leave an empty instructor by removing all
		//	classes mapped to that instructor.
		//	TODO Write a loop that checks for empty instructors and bumps all proceeding classes
		//	down one instructor
	},

	clearAllLessons: function() {
			Lessons.remove({});
	}

}); 

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup
});

}
