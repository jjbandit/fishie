Template.lessonSetTemplate.helpers({

	idString: function (objectIdObj) {
		return objectIdObj.valueOf();
		console.log(objectIdObj.toString());
	},

	sanitizeWeekdays: function (weekdays) {
		
		// This can be done with an array much more cleanly;
		// have an index corresponding to each day of week
		// then just query the array
		var returnArray = [];
		var ln = weekdays.length;
		for (var i = 0; i < ln; i++) {
			switch (parseInt(weekdays[i], 10)) {
				case 0:
					returnArray.push("Sunday");
					continue;
				case 1:
					returnArray.push("Monday");
					continue;
				case 2:
					returnArray.push("Tuesday");
					continue;
				case 3:
					returnArray.push("Wednesday");
					continue;
				case 4:
					returnArray.push("Thursday");
					continue;
				case 5:
					returnArray.push("Frday");
					continue;
				case 6:
					returnArray.push("Saturday");
					continue;
			}
		}
		//end for
		return returnArray;
	}
});

