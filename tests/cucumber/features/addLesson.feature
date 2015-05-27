Feature: Add Lessons to Lessons collection

	As a user
	I want to add lessons to the Lessons Collection
	So that I can modify my roster

Background:
	Given I navigate to ""
	And "Jesse" has logged in

# @dev
Scenario:
	Given The logged in user has created a "Monday" Lesson Set
	When I submit the default form
	Then I should see 1 Lesson and 1 Instructor

# @dev
Scenario:
	Given The logged in user has created a "Monday" Lesson Set
	And I submit the default form
	When I click on ".clear-lesson"
	Then I should see 0 Lesson and 0 Instructor

# @dev
Scenario:
	Given The logged in user has created a "Monday" Lesson Set
	And Create a "SK 2" at 2:00 PM with 2 swimmers
	And Create a "SK 5" at 5:00 PM with 5 swimmers
	Then I should see 2 Lesson and 1 Instructor

# @dev
Scenario:
	Given The logged in user has created a "Tuesday" Lesson Set
	When Create a "SK 2" at 12:00 PM with 3 swimmers
	And Create a "SK 3" at 12:00 PM with 2 swimmers
	Then I should see 1 Lesson and 1 Instructor
