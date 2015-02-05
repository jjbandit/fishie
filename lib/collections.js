var lessons = {
	endTime: function() {
		var startTime = this.lessonTimes[0].getTime();
		var length = this.length;
		var endTime = startTime + (60000 * (length+1));
		return new Date(endTime);
	},
	startTime: function() {
		return this.lessonTimes[0];
	},
}


Lessons = new Mongo.Collection("lessons", {
	transform: function (doc) {
		// Create an empty object with our custom proto
		var newInstance = Object.create(lessons);
		// copy the data from doc to newInstance and return newInstance
		return _.extend(newInstance, doc);
	}
});
Instructors = new Mongo.Collection("instructors");
