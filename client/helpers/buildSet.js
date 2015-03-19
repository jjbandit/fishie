Template.buildSet.events ({
	'submit': function () {
		event.preventDefault();

		var weekdays = $('input[name=weekday-toggle]:checked', '#weekday-wrapper').map( function() {
			return $(this).val();
		}).get();

		if (weekdays.length === 0) { return; }

		var setID = new Mongo.ObjectID();
		Meteor.call('createLessonSet', setID, weekdays);

		Router.go('setShow', {_id: setID._str});
	}
});
