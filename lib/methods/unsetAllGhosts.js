Meteor.methods({
unsetAllGhosts: function() {
	Lessons.update({owner: Meteor.userId()}, {$unset: {ghost: 'true'}}, {multi: true});
}
});
