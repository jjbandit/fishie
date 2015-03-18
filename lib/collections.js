var lessons = {
	endTime: function() {
		if (this.lessonTimes.length > 0) {
			var startTime = this.lessonTimes[0].getTime();
			var length = this.length;
			var endTime = startTime + (60000 * (length+1));
			return new Date(endTime);
		}
	},
	startTime: function() {
		if (this.lessonTimes.length > 0) {
			return this.lessonTimes[0];
		}
	},
	isGhost: function () {
		if(this.levels[0] == 'ghost' && this.ghost) {
			return true;
		} else {
			return false;
		}
	}
}

Lessons = new Mongo.Collection("lessons", {
	transform: function (doc) {
		// Create an empty object with our custom proto
		var newInstance = Object.create(lessons);
		// copy the data from doc to newInstance and return newInstance
		return _.extend(newInstance, doc);
	}
});

var instructors = {
	startTime: function () {
		return this.lessonTimes[0];
	},
	endTime: function () {
		return this.lessonTimes[this.lessonTimes.length - 1];
	}
}

Instructors = new Mongo.Collection("instructors", {
	transform: function (doc) {
		// Create an empty object with our custom proto
		var newInstance = Object.create(instructors);
		// copy the data from doc to newInstance and return newInstance
		return _.extend(newInstance, doc);
	}
});

lessonSets = {
	timeSpan: function () {
		var setInstructors = Instructors.find({set: this._id}).fetch();
		if (setInstructors.length == 0) { return setInstructors; }
		var returnArray = [];

		// Build a sorted array of all lesson times occuring in setInstructors
		var ln = setInstructors.length;
		for (var i = 0; i < ln; i++) {
			returnArray = _.union(returnArray, setInstructors[i].lessonTimes);
		}
		returnArray = Fishie.sortDateArray(returnArray);

		// Now append one additional 15 minute block to the end of the array
		//   so that this function returns the full span of the set
		var lastTime = returnArray[returnArray.length - 1];
		var lastTime = lastTime.getTime() + 900000;
		returnArray.push(new Date(lastTime));

		return returnArray;
	}
}

LessonSets = new Mongo.Collection("lessonSets", {
	transform: function (doc) {
		// Create an empty object with our custom proto
		var newInstance = Object.create(lessonSets);
		// copy the data from doc to newInstance and return newInstance
		return _.extend(newInstance, doc);
	}
});

// Sub/Pub statements

if (Meteor.isClient) {
	Meteor.subscribe("lessons");
	Meteor.subscribe("lessonSets");
	Meteor.subscribe("instructors");
}

if (Meteor.isServer) {
	Meteor.publish('lessons', function () {
		return Lessons.find({owner: this.userId});
	});

	Meteor.publish('instructors', function () {
		return Instructors.find({owner: this.userId});
	});

	Meteor.publish('lessonSets', function () {
		return LessonSets.find({owner: this.userId});
	});
}
