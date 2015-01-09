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

			// TODO Submit new event based on radio selection
			console.log(event);

			level = event.target.level-toggle.value;
			time = event.target.time-toggle.value;

			console.log(level);
		}
	});
	
	
}

Meteor.methods ({

	createClass: function(level, time) {
		Classes.insert ({
			level: level,
			createdAt: new Date()
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
