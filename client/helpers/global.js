UI.registerHelper (
	'sanitizeTime', function(timeObj) {
		var minutes = timeObj.getMinutes();
		var hours = timeObj.getHours();
		var amPm = ' AM';
		var day = timeObj.toDateString().slice(0, 3);
		if (minutes == 0) {
			minutes = '00';
		}
		if (hours > 12) {
			hours = hours - 12;
			amPm = ' PM';
		}
		var saneTime = day + ' ' +  hours + ":" + minutes + amPm;
		return saneTime;
	}
);

UI.registerHelper (
	'sanitizeWeekdays', function (weekdays) {
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
);
