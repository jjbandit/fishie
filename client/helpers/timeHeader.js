Template.timeHeader.helpers({
	timeBlock: function() {
		var firstLesson = Lessons.findOne({owner: Meteor.userId()}, {sort: {lessonTimes: 1}});
		var lastLesson = Lessons.findOne({owner: Meteor.userId()}, {sort: {lessonTimes: -1}});
		if (firstLesson) {
			var firstTime = firstLesson.startTime();
			var lastTime = lastLesson.endTime();
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
