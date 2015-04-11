Template.createLesson.events ({
	'submit form' : function(event) {
		// Prevent form refresh
		event.preventDefault();

		if (!Meteor.user()) { return false; }

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
		var lessonID = new Meteor.Collection.ObjectID()._str;
		// Same with the instructor for the case that we're inserting a new one
		var instrID = new Meteor.Collection.ObjectID()._str;
		Meteor.call('createLesson', lessonID, instrID, setID, level, weekdays, startTime, length, swimmers, privateClass);
	},

	'change .upload-lessons' : function(event) {
		// We have to pass in a set Id because it's only available to us on the client
		var setId = Router.current().params._id;
		var startTime = new Date(1989, 0, 6, 2, 0, 0, 0);

		var barcodeList = [];

		$('.upload-lessons').parse({
			config: {
				complete: function(results, file) {
					console.log(results);
					$.each(results.data, function() {

						// FIXME Not sure if we can do much about this
						// Papaparse treats newlines as new rows and returns an extra empty object at the EOF
						// so we have to check for this object :/
						if (this.length === 1) { return; }

						var instrID = new Meteor.Collection.ObjectID()._str;
						var lessonID = new Meteor.Collection.ObjectID()._str;

						// Here we're assuming that the csv we're feeding papaparse ALWAYS has the same format.
						// Sounds sketchy at best considering CLASS..
						var level = parseInt((this[10]).match(/\d+/));

						// parseInt returns NaN when match doesn't encounter a number in the level index (this[10])
						// so we know we're dealing with either a preschool level or some garbage
						// TODO Handle preschool levels and private levels
						if (isNaN(level)) {
							return true;
						}

						// Get end time
						var splitDate = this[22].split('-');
						var startTime = new Date(splitDate[0]);
						startTime.setDate(7);
						startTime.setMonth(0);
						startTime.setYear(1989);
						var defaultDate = '7 Jan 1989 ';
						var endTime = new Date(defaultDate.concat(splitDate[1]));
						console.log(startTime);
						console.log(endTime);
						var diff = endTime.getTime() - startTime.getTime();
						diff = (diff / 60000) - 1;

						// Sanity check
						var swimmers = parseInt((this[25]).match(/\d+/));
						var barcode = parseInt((this[11]).match(/\d+/));
						if (isNaN(swimmers) || isNaN(barcode)) {
							return true;
						}

						if (barcodeList.indexOf(barcode) === -1) {
							barcodeList.push(barcode);
							var lessonObj = Fishie.parseLessonObject(lessonID, setId, level, false, swimmers, [0], startTime, diff);
							lessonObj.barcode = barcode;
							Meteor.call('createLesson', lessonObj);
						}
					});
				}
			},

			complete: function()
			{
				console.log('done lessons');
			}
		});
	}
});
