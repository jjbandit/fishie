Template.createClass.events ({
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

		Meteor.call('createClass', level, startTime, length, swimmers, privateClass);
	}
});
