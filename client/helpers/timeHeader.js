Template.timeHeader.helpers({
	timeBlock: function(setId) {
		var setObj = LessonSets.findOne(setId);
		var timeSpan = setObj.timeSpan();
		var firstTime = timeSpan[0];
		var lastTime = timeSpan[timeSpan.length - 1];

		if (firstTime && lastTime) {
			var blocks = Fishie.getTimeBlocks(firstTime, lastTime);
			return blocks;
		}
	},
	sanitizeHeaderTime: function(timeObj) {
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
		var saneTime = hours + ":" + minutes + amPm;
		return saneTime;
	}
});
