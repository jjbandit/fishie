UI.registerHelper (
	'sanitizeTime', function(timeObj) {
		var minutes = timeObj.getMinutes();
		var hours = timeObj.getHours();
		var amPm = ' AM';
		if (minutes == 0) {
			minutes = '00';
		}
		if (hours > 12) {
			hours = hours - 12;
			amPm = ' PM';
		}
		saneTime = hours + ":" + minutes + amPm;
		return saneTime;
	});
