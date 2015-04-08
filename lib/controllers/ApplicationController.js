ApplicationController = RouteController.extend({
	onBeforeAction: function () {
		if (!Meteor.user()) {
			this.render('login');
		} else {
			this.next();
		}
	}
});
