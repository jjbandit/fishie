Template.lengthSelector.helpers ({
	getLength: function () {
		return  Session.get('Stage.length') || '30';
	},
});

Template.lengthSelector.events ({
	'change input.length-toggle' : function (event) {
		$( '#length-wrapper' ).hide();
		Session.set('Stage.length', parseInt(event.target.value) + 1);
	},
	'click .length' : function (event) {
		$(' #length-wrapper ' ).show();
	}
});
