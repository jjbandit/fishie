Template.lesson.helpers ({
	getLesson: function(lessonID) {
		return Lessons.findOne(lessonID);
	},
	sanitizeLevels: function(levelsAry) {
		if (levelsAry[0] > 10) {
			return 'Preschool ' + levelsAry;
		} else {
			return 'Swim Kids ' + levelsAry;
		}
	},
});
Template.lesson.events ({
	'mousedown #lesson-controls': function() {
		var lessonTimes = this.lessonTimes;
		var availableInstructors = Instructors.find({lessonTimes: {$nin: lessonTimes}}).fetch();
		// console.log(availableInstructors);
		if (availableInstructors.length > 0) {
			Fishie.addGhostLessons(availableInstructors, lessonTimes);
		}
	}
});


Template.lesson.rendered = function () {
	console.log('yay');
	var dragTarget = this.$('div#lesson');
	dragTarget.draggable({cursor: "move", handle: "div#lesson-controls", revert: true});
};
