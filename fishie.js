Lessons = new Mongo.Collection("lessons");

if (Meteor.isClient) {
	Meteor.subscribe("lessons");

	Template.body.helpers ({
		lessons: function() {
			return Lessons.find({}, {sort: {instructor: 1}});
		},
		instructor: function() {
			// find the number of instructors
			maxInstrCursor = Lessons.findOne({},{sort: {instructor: -1}});
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
			return Lessons.find({instructor: instr});
		},
	});

	Template.body.events ({
		'click .clear' : function() {
				Meteor.call("clearLessons");
		}
	});
	
	
	Template.createClass.events ({
		'submit form' : function() {
			// Prevent form refresh
			event.preventDefault();

			// Set time for lesson
			var startTime = new Date();

			// Get values from radio buttons and convert to integers
			hour = parseInt($('input[name=time-toggle]:checked', '#hour-wrapper').val());
			minute = parseInt($('input[name=minute-toggle]:checked', '#minute-wrapper').val());
			Pm = parseInt($('input[name=am-pm-toggle]:checked', '#am-pm-wrapper').val());

			// Convert PM times to 24h
			if (Pm) {
				hour=hour+12;
			};

			startTime.setHours(hour);
			startTime.setMinutes(minute);
			// Set seconds/milliseconds for sorting
			startTime.setSeconds(0);
			startTime.setMilliseconds(0);

			level = parseInt($('input[name=level-toggle]:checked', '#level-wrapper').val());
			length = parseInt($('input[name=length-toggle]:checked', '#length-wrapper').val());
			swimmers = parseInt($('input[name=swimmers-toggle]:checked', '#swimmers-wrapper').val());

			lessonID = new Meteor.Collection.ObjectID();

			Meteor.call('createClass', level, startTime, length, lessonID, swimmers);
		}
	});
}

Meteor.methods ({

	createClass: function(level, startTime, length, lessonID, swimmers) {
		// Minimilist validation
		check(level, Number);
		check(startTime, Date);
		check(length, Number);
		check(lessonID, Meteor.Collection.ObjectID);
		
		// Convert the ID object to a string
		// so it parses correctly
		strLessonID = lessonID._str;

		// Set the end time to the start time + the length of the class
		var endTime = new Date(startTime.toJSON());
		endTime.setMinutes(startTime.getMinutes() + length);

		// Check what level and set the class type 
		var classType = 'Swim Kids';

		if (level > 10) {
		classType = 'Preschool'
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

		// if the return above in the split loop didn't hit then insert a new class
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


	clearLessons: function() {
				Lessons.remove({})
	}

}); 

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup
});

Meteor.methods ({
	

});
	Meteor.publish("lessons",  function() {
		return Lessons.find()
	});
}
