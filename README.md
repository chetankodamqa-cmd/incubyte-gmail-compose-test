# Incubyte – Gmail Compose QA Assessment

## Feature Under Test
Gmail Compose Function – Send an email with:
- **Subject:** Incubyte
- **Body:** QA test for Incubyte

## Deliverables
| File | Description |
|------|-------------|
| Incubyte_Gmail_Compose_TestCases.xlsx | Excel sheet with all test cases |
| traditional.test.ts | Traditional style test cases (Playwright) |
| bdd.test.ts | BDD-style test cases (Given/When/Then) |
| GmailComposePage.ts | Page Object Model |
| playwright.config.ts | Playwright configuration |

## Test Coverage
- 12 Positive Traditional Test Cases
- 7 Negative Traditional Test Cases
- 10 Positive BDD Test Cases
- 7 Negative BDD Test Cases

## Tech Stack
- Playwright (TypeScript)
- Page Object Model
- Excel (Test Case Documentation)

## How to Run
```bash
npm install
npx playwright install chromium
export GMAIL_USER="chetankodamqa@gmail.com"
export GMAIL_PASS="abc@123"
npx playwright test
```
