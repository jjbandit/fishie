Classes = new Mongo.Collection("classes");

if (Meteor.isClient) {
	// Meteor.subscribe("classes");

	Template.body.helpers ({
		classes: function() {
			return Classes.find();
		},
	});

	Template.body.events ({
		'click .clear' : function() {
				Meteor.call("clearClasses");
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

			Meteor.call('createClass', level, time);
		}
	});
	
	
}

Meteor.methods ({

	createClass: function(level, time) {
		// Minimilist validation
		check(level, String);
		check(time, Date);

		Classes.insert ({
			level: level,
			time: time
		});
	},

	clearClasses: function() {
				Classes.remove({})
	},

	createInstructor: function() {
		Instructor.inse
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
