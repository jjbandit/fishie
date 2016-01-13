Feature: Split Swim Lessons

	As a user
	I want Fishie to automatically split swim lessons
	So that I can build the schedule quickly

Background:
	Given I navigate to ""
	And "Bill" has logged in
	And The logged in user has created a "Monday" Lesson Set

  # @dev
Scenario:
	Given Create a "SK 1" at 12:00 PM with 3 swimmers
	When Create a "SK 2" at 12:00 PM with 3 swimmers
	Then I should see 1 Lesson and 1 Instructor

  # @dev
Scenario:
	Given Create a "SK 1" at 12:00 PM with 3 swimmers
	When Create a "SK 2" at 12:00 PM with 4 swimmers
	Then I should see 2 Lesson and 2 Instructor

  # @dev
Scenario:
	Given Create a "SK 2" at 12:00 PM with 3 swimmers
	And Create a "SK 3" at 12:00 PM with 3 swimmers
	And Create a "SK 4" at 12:00 PM with 3 swimmers
	When Create a "SK 1" at 12:00 PM with 3 swimmers
	Then I should see 2 Lesson and 2 Instructor

  # @dev
Scenario:
	Given Create a "SK 2" at 12:00 PM with 3 swimmers
	And Create a "SK 3" at 12:00 PM with 3 swimmers
	And Create a "SK 4" at 12:00 PM with 3 swimmers
	And Create a "SK 5" at 12:00 PM with 3 swimmers
	And Create a "SK 6" at 12:00 PM with 3 swimmers
	When Create a "SK 1" at 12:00 PM with 3 swimmers
	Then I should see 3 Lesson and 3 Instructor
