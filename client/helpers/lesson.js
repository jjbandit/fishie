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
	'mousedown div#lesson-controls.ui-draggable-handle': function() {
		console.log('mouseDown');
		var lessonTimes = this.lessonTimes;
		var length = this.length;
		var availableInstructors = Instructors.find({lessonTimes: {$nin: lessonTimes}}).fetch();
		// console.log(availableInstructors);
		Fishie.addGhostLessons(availableInstructors, lessonTimes);
	}
});


Template.lesson.rendered = function () {
	var dragTarget = this.$('div#lesson');
	dragTarget.draggable({cursor: "move", handle: "div#lesson-controls", revert: true});
};
