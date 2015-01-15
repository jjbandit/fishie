Lessons = new Mongo.Collection("lessons");

if (Meteor.isClient) {
	Meteor.subscribe("lessons");

	Template.body.helpers ({
		lessons: function() {
			return Lessons.find();
		}
	});

	Template.body.events ({
		'click .clear' : function() {
				Meteor.call("clearLessons");
		}
	});
	
	

	Template.clearButtons.events ({
		'click .clear-instructor': function() {
			Meteor.call('clearInstructors');
		}
	});
	
	getVal = function (key) {
		return this.key;
	}

	
	
	Template.createClass.events ({
		'submit form' : function() {
			// Prevent form submit
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

			level = $('input[name=level-toggle]:checked', '#level-wrapper').val();
			length = parseInt($('input[name=length-toggle]:checked', '#length-wrapper').val());

			lessonID = new Meteor.Collection.ObjectID();

			Meteor.call('createClass', level, startTime, length, lessonID);
		}
	});
}

Meteor.methods ({

	createClass: function(level, startTime, length, lessonID) {
		// Minimilist validation
		check(level, String);
		check(startTime, Date);
		check(length, Number);
		check(lessonID, Meteor.Collection.ObjectID);
		
		// Convert the ID object to a string
		// so it parses correctly
		strLessonID = lessonID._str;

		// Set the end time to the start time + the length of the class
		var endTime = new Date(startTime.toJSON());
		endTime.setMinutes(startTime.getMinutes() + length);

		Lessons.insert ({
			level: level,
			instructor: 1,
			startTime: startTime,
			length: length,
			endTime: endTime,
			_id: strLessonID,
		});
		Meteor.call('sortNewClass', lessonID);
	},

	sortNewClass: function(newLessonID) {
		newLessonID_str = newLessonID._str;
		newLesson_obj = Lessons.findOne({_id: newLessonID_str});

		nst = newLesson_obj.startTime;
		net = newLesson_obj.endTime;

		// return the nubmer of instructors by sorting by instructor # and returning the first one
		numInstructors = Lessons.findOne({},{sort: {instructor: -1}}).instructor;
		// returns a cursor containing all classes that conflict with the new one
		conflictCursor = Lessons.find({$and: [{ $and: [{startTime:  {$lte: net}}, {_id: {$ne: newLessonID_str}}] }, { $and: [{endTime: {$gte: nst}}, {_id: {$ne: newLessonID_str}}] } ]});

		conflictInstrs = [];
		conflictObjs = conflictCursor.fetch();
		
		conflictObjs.forEach(function(lsn) {
			conflictInstrs.push(lsn.instructor);
		});

		// search from 1 until the total number of instructors + 1 (in the case there is not a free block) until we find
		// an available instructor.
		// If the loop gets to numInstructors + 1 that means there are no spots available and adds a new instructor to the array 
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
