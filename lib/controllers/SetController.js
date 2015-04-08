SetController = ApplicationController.extend ({
	onBeforeAction: function() {
		var set = LessonSets.findOne(this.params._id);
		if (set === undefined) {
			this.render('not-found');
		} else {
			this.next();
		}
	}
});
