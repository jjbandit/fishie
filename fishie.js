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
				Meteor.call("clearAllLessons");
		}
	});

	Template.lesson.helpers ({
		getClassName: function(lesson) {
			if (lesson.classType == 'Swim Kids') {
			 return lesson.classType + ' ' +lesson.level;
			} else if (lesson.classType == 'Preschool') {

				switch(lesson.level) {
					case 1:
						return 'Starfish';
						break;
					case 2:
						return 'Duck';
						break;
					case 3:
						return 'Sea Turtle';
						break;
					case 4:
						return 'Sea Otter';
						break;
					case 5:
						return 'Salamander';
						break;
					case 6:
						return 'Sunfish';
						break;
					case 7:
						return 'Crocodile';
						break;
					case 8:
						return 'Whale';
						break;
					default:
						return 'Swim Preschool' + lesson.level;
						console.log('default');
				}
			}
			
		},
	});
	
	Template.lesson.events ({

		'click .delete-lesson' : function() {
			Meteor.call('clearLesson', this._id);
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

			Meteor.call('createClass', level, startTime, length, swimmers);
		}
	});
}

Meteor.methods ({

	createClass: function(level, startTime, length, swimmers) {

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


		// Check if there are classes within 1 level that coincide with the proposed class and if there are
		// check number of participants.  Split it and return from the method if there are

		//  Return a cursor containing any candidates for a split 
		//  not sure if the AND is nessicary because of mongos implied and, but it works.

		//  FIXME This doesn't split classes three ways because a split level ends up with an array
		//  in the level property.  This is going to become a problem for 7-10 splits
		splitCursor = Lessons.find({
			$and : [
				{ startTime: startTime },
				{ classType: classType },
				{ endTime: endTime },
				{ $or : [
					{ level: level + 1 },{ level: level - 1 } 
				] },
			]
		});

		var splitArray = splitCursor.fetch();

		// FIXME This logic is dependant on which lesson is created first
		// splits spanning a breakpoint will apply this rule according to the 
		// second lesson
		// ie. a 4/5 split will have a max of 8 but a 5/4 split will have a max of 6

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
				
				// nest the new lesson in the split property of the existing lesson 
				Lessons.update(splitArray[i]._id, {$set: {split: true}});

				Lessons.update(splitArray[i]._id, {$set: {level: [splitArray[i].level, level]}});
				Lessons.update(splitArray[i]._id, {$set: {swimmers: [splitArray[i].swimmers, swimmers]}});
				return;
			}
		};

		// if split-class logic didn't hit a return insert a new Lesson record
		Lessons.insert ({
			level: level,
			classType: classType,
			split: false,
			instructor: 1,
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

		// return the nubmer of instructors by sorting by instructor # and returning the first one
		var numInstructors = Lessons.findOne({},{sort: {instructor: -1}}).instructor;
		// returns a cursor containing all classes that conflict with the new one
		var conflictCursor = Lessons.find({ startTime:  {$lte: net}, _id: {$ne: newLessonID_str}, endTime: {$gte: nst} });

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

	clearLesson: function(lessonID) {
		Lessons.remove(lessonID);
	},

	clearAllLessons: function() {
				Lessons.remove({})
	}

}); 

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup
});

}
