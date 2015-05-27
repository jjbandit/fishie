'use strict';
module.exports = function () {

	var appRoot = process.env.ROOT_URL;

	this.Given(/"([^"]*)" has logged in/, function(name, callback) {

			this.browser.execute( function () {
				Meteor.logout();
			});

			this.browser
			.waitForVisible('a.dropdown-toggle')
			.click('a.dropdown-toggle')
			.waitForVisible('#signup-link')
			.click('#signup-link')
			.setValue('#login-email', name + '@test.com')
			.setValue('#login-password', 'testPassword123')
			// Click login button
			.click('#login-buttons-password')
			// Wait to be logged in
			.waitForExist('#login-buttons-logout')
			// Ensure user sucessfully logged in
			.getText('a.dropdown-toggle').should.become(name + '@test.com').and.notify(callback);
	});

		this.Given(/^I click on "([^"]*)"$/, function (element, callback) {
			// Write code here that turns the phrase above into concrete actions
			this.browser
			.click(element);
			callback();
		})

		this.Given(/^The logged in user has created a "([^"]*)" Lesson Set$/, function (weekday, callback) {
			var weekdayLc = weekday.toLowerCase();
			var weekdayAbbr = weekday.slice(0,3);;
			this.browser
				.url(appRoot + 'set/create')
				.waitForVisible('#weekday-wrapper')
				.click('#weekday-' + weekdayLc + '-label')
				.submitForm('#create-set-wrapper')
				.waitForVisible('#schedule')
				.getText('.weekday-label').should.eventually.equal(weekdayAbbr).and.notify(callback);
			});

	this.Given(/^I navigate to "([^"]*)"$/, function (relativePath, callback) {
		this.browser
			.url(appRoot + relativePath, function (err, res) {
				if (!err) {
					callback();
				}
			});
		});

	this.When(/^Create a "([^"]*)" at (\d+):(\d+) ([^"]*) with (\d+) swimmers$/,
			function (levelString, hourString, minuteString, amPmString, numSwimmersString, callback) {
		var levelRadioSelector = '#' + levelString.toLowerCase().replace( ' ' , '-' ) + '-label';
		var swimmerRadioSelector = '#swimmers-' + numSwimmersString + '-label';
		var hourRadioSelector = '#time-hour-' + hourString + '-label';
		var minRadioSelector = '#time-minute-' + minuteString + '-label';
		var amPmRadioSelector = '#' + amPmString + '-label';

		this.browser
			.waitForVisible('#selectors-wrapper')
			.click('span.level')
			.click(levelRadioSelector)
			.click('span.num-swimmers')
			.click(swimmerRadioSelector)
			.click('span.hour')
			.click(hourRadioSelector)
			.click('span.minute')
			.click(minRadioSelector)
			.click('span.am-pm')
			.click(amPmRadioSelector)
			.click('#submit-create-lessons');

			this.browser.saveScreenshot(process.env.PWD + '/tests/cucumber/.screenshots/' + levelString + '.png');
		var fing = this.browser;
		// // Wait for write to db
		setTimeout( function () {
			callback();
		}, 500);
	});

	this.When(/^I submit the default form$/, function (callback) {
		this.browser
			.waitForExist('#create-lesson-controls')
			.waitForVisible('#create-lesson-controls')
			.submitForm('#create-lesson-controls')
			.waitForVisible('.lesson-level')
			.getText('.lesson-level').should.become('Swim Kids 1').and.notify(callback);
	});

this.Then(/^I should see (\d+) Break blocks$/, function (breakBlocksStr, callback) {
	var breakBlocks = parseInt(breakBlocksStr);

	this.browser
	.elements('.break-block', function (err, elems) {
		chai.expect(elems.value.length).to.equal(breakBlocks);
		callback();
	});
});

	this.Then(/^I should see (\d+) Lesson and (\d+) Instructor$/,
			function (numLessons, numInstructors, callback) {

		var numLessons = parseInt(numLessons);
		var numInstructors = parseInt(numInstructors);

		var browser = this.browser;
		// Wait half a second in case a previous test finished with an async call
		setTimeout(function () {

			browser
				.elements('.block-wrapper', function (err, elems) {
					chai.expect(elems.value.length).to.equal(numLessons);
				})

				.elements('.instructor-wrapper', function (err, elems) {
					chai.expect(elems.value.length).to.equal(numInstructors);
					callback();
				});

			}, 500);
	});
}
