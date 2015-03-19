Template.lessonSetTemplate.events({
	'click input#remove-set' : function () {
		Meteor.call('clearLessonSet', this._id);
	}
});

Template.lessonSetTemplate.helpers({
	idString: function (objectIdObj) {
		return objectIdObj.valueOf();
	},
});

