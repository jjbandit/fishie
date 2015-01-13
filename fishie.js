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
			var time = new Date;

			// Get values from radio buttons and convert to integers
			hour = parseInt($('input[name=time-toggle]:checked', '#hour-wrapper').val());
			minute = parseInt($('input[name=minute-toggle]:checked', '#minute-wrapper').val());
			Pm = parseInt($('input[name=am-pm-toggle]:checked', '#am-pm-wrapper').val());

			// Convert PM times to 24h
			if (Pm) {
				hour=hour+12;
			};

			time.setHours(hour);
			time.setMinutes(minute);
			// Set seconds/milliseconds for sorting
			time.setSeconds(0);
			time.setMilliseconds(0);

			level = $('input[name=level-toggle]:checked', '#level-wrapper').val();

			classID = new Meteor.Collection.ObjectID();

			Meteor.call('createClass', level, time, classID);
		}
	});
	
	
}

Meteor.methods ({

	createClass: function(level, time, classID) {
		// Minimilist validation
		check(level, String);
		check(time, Date);
		check(classID, Meteor.Collection.ObjectID);
		
		// Convert the ID object to a string
		// so it parses correctly
		strClassID = classID._str;

		Classes.insert ({
			level: level,
			time: time,
			_id: strClassID
		});

		Meteor.call('sortNewClass', classID);
	},

	sortNewClass: function(classID) {
		// Class Object
		classObj = Classes.findOne(classID._str);
		instCursor = Instructors.find({});

		// Initialize Instructors collection if empty
		if (instCursor.count() == 0) {
			instID = new Meteor.Collection.ObjectID();
			Meteor.call('createInstructor', instID);
		}

		// Loop through instructors to find one that doesn't already have
		// a class at the new class time

		classTime = classObj.time;

		console.log(classTime);

		instCursor.forEach( function(instr) {

			// if the current instr doesn't have a class at this time add it to their shit
			// TODO This if doesn't work, fix it
			if (instr.classTimes.indexOf(classObj.time) < 0) {
				Instructors.update(instr._id, {$push: {classTimes: classObj.time, classList: classObj}});
				console.log('updated instr');
				return;
			} else {
				console.log('need a new instr');
			}

		});

			// Meteor.call('addClassToInst', classObj, Instructors.findOne(instID._str));
	},

	// addClassToInst: function(classObj, inst) {
	// 	console.log('yay');
	// 	console.log(classObj);
	// 	console.log(inst);
	// },

		// accepts optional ObjectID and Class object to initialize classList
	createInstructor: function(instID) {
		// check if an ID is passed in and create one if not
		if (instID == null) {
			instID = new Meteor.Collection.ObjectID();
		}

		// TODO Validate with check()
		// figure out how to use class objects; Prototype?

		Instructors.insert ({
			name: 'Instructor ' + (Instructors.find().count() + 1),
			// Keep track of what time each instr has classes at
			// because a nested forEach looop sucks
			classTimes: [],
			classList: [],
			_id: instID,
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
  });
	

	// Meteor.publish("classes",  function() {
	// 	return Classes.find()
	// 		});
}
