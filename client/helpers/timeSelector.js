Template.timeSelector.events ({
	'change input.hour-toggle' : function (event) {
		$( '#hour-wrapper' ).hide();
		Session.set('Stage.hour', event.target.value);
	},
	'change input.minute-toggle' : function (event) {
		$( '#minute-wrapper' ).hide();
		Session.set('Stage.minute', event.target.value);
	},
	'change input.am-pm-toggle' : function (event) {
		$( '#am-pm-wrapper' ).hide();
		var amPm = 'PM';

		if (parseInt(event.target.value) === 0) {
			amPm = 'AM';
		}

		Session.set('Stage.amPm', amPm);
	},

	'click .hour' : function (event) {
		$(' #hour-wrapper ' ).show();
	},
	'click .minute' : function (event) {
		$(' #minute-wrapper ' ).show();
	},
	'click .am-pm' : function (event) {
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
