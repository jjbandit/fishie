Template.createLesson.events ({
	'submit form' : function() {
		// Prevent form refresh
		event.preventDefault();

		// Set time for lesson
		var startTime = new Date(1989, 0, 6, 0, 0, 0, 0);

		// Get values from radio buttons and convert to integers
		var hour = parseInt($('input[name=time-toggle]:checked', '#hour-wrapper').val());
		var minute = parseInt($('input[name=minute-toggle]:checked', '#minute-wrapper').val());
		var Pm = parseInt($('input[name=am-pm-toggle]:checked', '#am-pm-wrapper').val());

		// Convert PM times to 24h
		if (Pm) {
			hour=hour+12;
		};

		// Seconds and milleseconds are set when startTime is initialized
		startTime.setHours(hour);
		startTime.setMinutes(minute);

		var level = parseInt($('input[name=level-toggle]:checked', '#level-wrapper').val());
		var length = parseInt($('input[name=length-toggle]:checked', '#length-wrapper').val());
		var swimmers = parseInt($('input[name=swimmers-toggle]:checked', '#swimmers-wrapper').val());
		var privateClass = parseInt($('input[name=private-toggle]:checked', '#private-wrapper').val());

		// This is some magic copy/pasted from stackOverflow I don't really understand
		var weekdays = $('input[name=weekday-toggle]:checked', '#weekday-wrapper').map( function() {
			return $(this).val();
		}).get();

		// Get the id of the set we're adding the lesson to
		// The lesson is never made aware of what set it belongs to but this is the only
		// entry point so we have to send it in here
		var setID = Router.current().params._id;
		// We must create a lesson ID here and pass it to the create method so the server
		// and client are on the same page as far as the lessonID goes
		var lessonID = new Meteor.Collection.ObjectID();
		// Same with the instructor for the case that we're inserting a new one
		var instrID = new Meteor.Collection.ObjectID();
		Meteor.call('createLesson', setID, instrID, lessonID, level, weekdays, startTime, length, swimmers, privateClass);
	}
});
