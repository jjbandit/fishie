Meteor.methods({
unsetAllGhosts: function() {
	console.log('unsetting');
	Lessons.update({}, {$unset: {ghost: 'true'}}, {multi: true});
}
});
