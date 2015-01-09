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

  Template.newClassButtons.events({
    'click button': function () {
			level = event.target.classList.item(1);
			Meteor.call ("addClass", level);
		}
  });

	Template.time.events ({
		'click button' : function() {
			Meteor.call("addTime");
		}
	});

}

Meteor.methods ({

	addClass: function(level) {
		Classes.insert ({
			level: level,
			createdAt: new Date()
		});
	},
	addTime: function() {
		
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
