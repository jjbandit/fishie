Template.buildSet.events ({
	'submit': function () {
		event.preventDefault();

		var weekdays = $('input[name=weekday-toggle]:checked', '#weekday-wrapper').map( function() {
			return $(this).val();
		}).get();

		Meteor.call('createLessonSet', weekdays);
	}
});
