Template.timeSelector.events ({
	// Handlers that hide the radio buttons and set Sessions when they're clicked
	'click input.hour-toggle' : function (event) {
		$( '#hour-wrapper' ).hide();
		Session.set('Stage.hour', event.target.value);
	},
	'click input.minute-toggle' : function (event) {
		$( '#minute-wrapper' ).hide();
		Session.set('Stage.minute', event.target.value);
	},
	'click input.am-pm-toggle' : function (event) {
		$( '#am-pm-wrapper' ).hide();
		var amPm = parseInt(event.target.value) ? 'PM' : 'AM' ;
		Session.set('Stage.amPm', amPm);
	},

	// Handlers to expose the radio buttons when the appropriate span selector is clicked
	'click span.hour' : function (event) {
		$(' #hour-wrapper ' ).show();
	},
	'click span.minute' : function (event) {
		$(' #minute-wrapper ' ).show();
	},
	'click span.am-pm' : function (event) {
		$(' #am-pm-wrapper ' ).show();
	},
});

Template.timeSelector.helpers ({
	getHour: function () {
		return Session.get('Stage.hour') || 1;
	},
	getMinute: function () {
		return Session.get('Stage.minute') || '00';
	},
	getAmPm: function () {
		return Session.get('Stage.amPm') || 'AM';
	},
});
