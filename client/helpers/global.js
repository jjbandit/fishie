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
	});
