'use strict';

module.exports = function () {
	this.Before(function (event, callback) {
		this.ddp.call('reset', [], callback);
	});
}
