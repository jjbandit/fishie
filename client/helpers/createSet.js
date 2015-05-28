Template.createSet.events ({
	'submit': function (event) {
		event.preventDefault();

		var weekdays = $('input[name=weekday-toggle]:checked', '#weekday-wrapper').map( function() {
			return $(this).val();
		}).get();

		if (weekdays.length === 0) { return; }

		var setId = new Meteor.Collection.ObjectID()._str;
		Meteor.call('createLessonSet', weekdays, setId);

		Router.go('setShow', {_id: setId});
	}
});
