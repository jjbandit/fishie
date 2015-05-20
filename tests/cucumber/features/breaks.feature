Feature: Breaks
	As a user
	When I add lessons with time between them
	I want to get visual feedback that shows unused time
	So I can maximize instructon time

Background:
	Given I navigate to ""
	And "Bill" has logged in
	And The logged in user has created a "Monday" Lesson Set

@dev
Scenario:
	Given Create a "SK 2" at 1:00 PM with 3 swimmers
	When Create a "SK 2" at 2:00 PM with 3 swimmers
	Then I should see 2 Break blocks

@dev
Scenario:
	Given Create a "SK 9" at 1:00 PM with 3 swimmers
	When Create a "SK 10" at 2:00 PM with 3 swimmers
	Then I should see 0 Break blocks

@dev
Scenario:
	Given Create a "SK 2" at 1:00 PM with 3 swimmers
	When Create a "SK 10" at 1:00 PM with 3 swimmers
	Then I should see 2 Break blocks

@dev
Scenario:
	Given Create a "SK 2" at 1:30 PM with 3 swimmers
	When Create a "SK 10" at 1:00 PM with 3 swimmers
	Then I should see 2 Break blocks
