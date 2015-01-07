Classes = new Mongo.Collection("classes");

if (Meteor.isClient) {
	// Meteor.subscribe("classes");

	Template.body.helpers ({
		classes: function() {
			return Classes.find();
		}

	});

  Template.newClassButtons.events({

    'click button': function () {
			level = event.target.classList.item(1);

			// level.forEach(getLevel);
			
			// function getLevel (element, index, array) {
			// 	console.log(index + element);
			// }

			Meteor.call ("addClass", level);
		}
  });
}

Meteor.methods ({
	addClass: function(level) {
		Classes.insert ({
			level: level,
			createdAt: new Date()
		});
			console.log(Classes.find().count());
			console.log(Classes.findOne({}, {skip: Classes.find().count()-1})); 
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
