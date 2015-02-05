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
Template.lesson.rendered = function () {
	console.log('yay');
	var dragTarget = this.$('div#lesson');
	dragTarget.draggable({cursor: "move", handle: "div#lesson-controls"});
};
