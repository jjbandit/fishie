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
		// so we don't have to fuck around with a callback
		strClassID = classID._str;

		newClass = Classes.insert ({
			level: level,
			time: time,
			_id: strClassID
		});

		Meteor.call('sortNewClass', classID);
	},

	sortNewClass: function(classID) {
		newClass = Classes.findOne(classID._str);

		inst = Instructors.find({});

		// Initialize Instructors collection
		if (inst.count() == 0) {
			instID = new Meteor.Collection.ObjectID();
			Meteor.call('createInstructor', instID, newClass);
			return;
		}

		// TODO Fix these for preformance
		// nested forEach loops.. fuck.
		inst.forEach(

			function  (instr) {
				instr.classList.forEach(

					function (eachClass) {
						console.log(eachClass.time);
						if (eachClass.time.getTime() == newClass.time.getTime()) {
							instID = new Meteor.Collection.ObjectID();
							Meteor.call('createInstructor', instID, newClass); } }		
				);

			}
		);

	},

		// accepts optional ObjectID and Class object to initialize classList
	createInstructor: function(instID, initClass) {
		// check if an ID is passed in and create one if not
		if (instID == null) {
			instID = new Meteor.Collection.ObjectID();
		}

		Instructors.insert ({
			name: 'Instructor ' + (Instructors.find().count() + 1),
			classList: [initClass],
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
