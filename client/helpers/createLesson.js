Template.createLesson.events ({
	'submit form' : function() {
		// Prevent form refresh
		event.preventDefault();

		// Set time for lesson
		var startTime = new Date();

		// Get values from radio buttons and convert to integers
		var hour = parseInt($('input[name=time-toggle]:checked', '#hour-wrapper').val());
		var minute = parseInt($('input[name=minute-toggle]:checked', '#minute-wrapper').val());
		var Pm = parseInt($('input[name=am-pm-toggle]:checked', '#am-pm-wrapper').val());

		// Convert PM times to 24h
		if (Pm) {
			hour=hour+12;
		};

		startTime.setHours(hour);
		startTime.setMinutes(minute);
		// Set seconds/milliseconds for sorting
		startTime.setSeconds(0);
		startTime.setMilliseconds(0);

		var level = parseInt($('input[name=level-toggle]:checked', '#level-wrapper').val());
		var length = parseInt($('input[name=length-toggle]:checked', '#length-wrapper').val());
		var swimmers = parseInt($('input[name=swimmers-toggle]:checked', '#swimmers-wrapper').val());
		var privateClass = parseInt($('input[name=private-toggle]:checked', '#private-wrapper').val());
		var weekday = $('input[name=weekday-toggle]:checked', '#weekday-wrapper').map( function() {
			return $(this).val();
		}).get();
		console.log(weekday);

		// We must create this here and pass it to the method so the server
		// and client are aware of what the lessonID is going to be
		var lessonID = new Meteor.Collection.ObjectID();
		Meteor.call('createLesson', lessonID, level, startTime, length, swimmers, privateClass);
	}
});
