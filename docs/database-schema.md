# Database Schema

Current status: the active mobile prototype stores data locally in Zustand. No database is required for the current Expo demo.

Future persistence should cover:

## User

- id
- fullName
- mobileNumber
- preferredLanguage
- occupation
- createdAt

## Business Profile

- userId
- monthlyIncome
- monthlyExpenses
- hasActiveLoans
- pastRepaymentHabit
- businessDetails JSON

## Transaction

- id
- userId
- type
- amount
- category
- note
- date

## Loan

- id
- userId
- type
- personName
- amount
- remainingAmount
- interestRate
- dueDate
- status
- date

## Operational Records

Future role-specific tables or JSON records can persist:

- Shop: udhar entries, stock cycle items.
- Tailor: order queue, delivery plan.
- Daily wage: shift tracker, payment due.
- Farmer: mandi watchlist, RTC status.
