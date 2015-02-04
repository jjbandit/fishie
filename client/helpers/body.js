Template.body.events ({
	'mouseup': function() {
		if (Session.get('dragging')){
			Session.set('dragging', false);
			$('div').remove('.ghost-lesson');
		}
	},
});
