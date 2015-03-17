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
		var setInstructors = Instructors.find({set: this._id});
		var returnArray;

		var ln = setInstructors.length;
		for (var i; i > ln; i++) {
			_.union(returnArray, setInstructors[i].lessonTimes);
		}
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
