Meteor.methods({
unsetAllGhosts: function() {
	console.log('unsetting');
	Lessons.update({owner: Meteor.userId()}, {$unset: {ghost: 'true'}}, {multi: true});
}
});
