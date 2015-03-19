Template.instructorList.helpers ({
	instructors: function(setId) {
		return Instructors.find({owner: Meteor.userId(), set: setId}, {sort: {createdAt: 1}});
	},
	sortedLessonList: function(lessonID_ary) {
		return Lessons.find({_id: {$in: lessonID_ary}, owner: Meteor.userId()}, {sort: {lessonTimes: 1}});
	},
	getLeadingBreaks: function(lessonObj) {
		return Fishie.getLeadingBreaks(lessonObj);
	},
	getTrailingBreaks: function(lessonObj) {
		return Fishie.getTrailingBreaks(lessonObj, false);
	}
});
// Template.
Template.instructorList.events ( {
	'blur input.instructor-name': function () {
		console.log(this);
		console.log(event.target.value);
		Fishie.setInstructorName(this, event.target.value);
	},
});
