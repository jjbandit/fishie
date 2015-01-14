Classes = new Mongo.Collection("classes");
Instructors = new Mongo.Collection("instructors");

if (Meteor.isClient) {
	// Meteor.subscribe("classes");

	Template.body.helpers ({
		classes: function() {
			return Classes.find();
		},
		instructors: function() {
			return Instructors.find();
		}
	});

	Template.body.events ({
		'click .clear' : function() {
				Meteor.call("clearClasses");
		}
	});

	Template.instructor.helpers ({
		showClasses: function() {
			return 'this is a class!';
		}
	});
	
	

	Template.createInstructor.events ({
		'click .clear-instructor': function() {
			Meteor.call('clearInstructors');
		}
	});
	
	
	Template.createClass.events ({
		'submit form' : function() {
			// Prevent form submit
			event.preventDefault();

			// Set time for lesson
			var startTime = new Date;

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

			classID = new Meteor.Collection.ObjectID();

			Meteor.call('createClass', level, startTime, length, classID);
		}
	});
	
	
}

Meteor.methods ({

	createClass: function(level, startTime, length, classID) {
		// Minimilist validation
		check(level, String);
		check(startTime, Date);
		check(length, Number);
		check(classID, Meteor.Collection.ObjectID);
		
		// Convert the ID object to a string
		// so it parses correctly
		strClassID = classID._str;

		Classes.insert ({
			level: level,
			startTime: startTime,
			length: length,
			_id: strClassID,
		});

		Meteor.call('sortNewClass', classID);
	},

	sortNewClass: function(classID) {

		classObj = Classes.findOne(classID._str);
		startTime = classObj.startTime;
		instCursor = Instructors.find({}, {sort: {name: 1}});


		// cannot break out of the forEach function :/
		// so we have to keep track of whether or not the class
		// has been assigned to an instructor
		classAssigned = false;

		// Loop through instructors to find one that doesn't already have
		// a class at the new class time
		// TODO  Implement checking for class length
		instCursor.forEach( function(instr) {

			// assume there is a time slot
			timeAvailable = true;

			// Loop through class times looking for a match
			instr.classTimes.forEach( function(ct) {
				if (ct.getTime() == classObj.startTime.getTime()) {
					timeAvailable = false;
				}
			});

			// If the current instructor has a time slot available and
			// the class hasn't already been assigned assign it to this instr
			if (timeAvailable && !classAssigned) {
				Instructors.update(instr._id, {$push: {classTimes: classObj.startTime, classList: classObj}});
				classAssigned = true;
			}
		});

		// if the class didn't get assigned during the previous loops
		// create a new instructor and assign it
		if (!classAssigned) {
		Meteor.call('createAndInitInstructor', classObj);
		}
	},

		// accepts optional ObjectID and Class object to initialize classList
	createInstructor: function(instID, initClass) {
		// check if an ID is passed in and create one if not
		// figure out how to use class objects; Prototype?
		if (instID == null) {
			instID = new Meteor.Collection.ObjectID();
		}

		Instructors.insert ({
			name: 'Instructor ' + (Instructors.find().count() + 1),
			// Keep track of what time each instr has classes at
			// because a nested forEach looop sucks
			classTimes: [],
			classList: [],
			_id: instID
		});
	},
	createAndInitInstructor: function(initClass) {
		Instructors.insert ({
			name: 'Instructor ' + (Instructors.find().count() + 1),
			// Keep track of what time each instr has classes at
			// because a nested forEach looop sucks
			classTimes: [initClass.startTime],
			classList: [initClass],
		});
	},

	clearClasses: function() {
				Classes.remove({})
	},

	clearInstructors: function() {
		Instructors.remove({});
	}
}); 

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup
		instCursor = Instructors.find({});

		// Initialize Instructors collection if empty
		if (instCursor.count() == 0) {
			instID = new Meteor.Collection.ObjectID();
			Meteor.call('createInstructor', instID);
		}
  });
	

	// Meteor.publish("classes",  function() {
	// 	return Classes.find()
	// 		});
}
