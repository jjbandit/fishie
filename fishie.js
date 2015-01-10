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
			event.preventDefault();

			hour = $('input[name=time-toggle]:checked', '#hour-wrapper').val();
			minute = $('input[name=minute-toggle]:checked', '#minute-wrapper').val();
			amPm = $('input[name=am-pm-toggle]:checked', '#am-pm-wrapper').val();

			level = $('input[name=level-toggle]:checked', '#level-wrapper').val();

			Meteor.call('createClass', level, hour, minute, amPm);
		}
	});
	
	
}

Meteor.methods ({

	createClass: function(level, hour, minute, amPm) {
		Classes.insert ({
			level: level,
			hour: hour,
			minute: minute,
			amPm: amPm
		});
	},

	clearClasses: function() {
				Classes.remove({})
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
