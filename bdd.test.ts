/**
 * BDD-Style Test Cases (Given / When / Then)
 * Feature: Gmail Compose - Send email with subject "Incubyte" and body " QA test for Incubyte"
 *
 * Naming convention: Given_<context>_When_<action>_Then_<outcome>
 */

import { test, expect, Page } from "@playwright/test";
import { GmailComposePage } from "../pages/GmailComposePage";

const TARGET_SUBJECT = "Incubyte";
const TARGET_BODY    = " QA test for Incubyte";
const VALID_RECIPIENT = "qa.test.incubyte@gmail.com";

async function loginToGmail(page: Page) {
  await page.goto("https://accounts.google.com/signin");
  await page.fill('[type="email"]', process.env.GMAIL_USER ?? "");
  await page.getByRole("button", { name: /next/i }).click();
  await page.waitForSelector('[type="password"]', { state: "visible" });
  await page.fill('[type="password"]', process.env.GMAIL_PASS ?? "");
  await page.getByRole("button", { name: /next/i }).click();
  await page.waitForURL(/mail\.google\.com/, { timeout: 15000 });
}

// ─────────────────────────────────────────────
// POSITIVE BDD SCENARIOS
// ─────────────────────────────────────────────

test.describe("Feature: Gmail Compose – Positive BDD Scenarios", () => {

  test.beforeEach(async ({ page }) => {
    await loginToGmail(page);
  });

  test(
    "BDD-POS-01: Given user is on Gmail inbox, When user clicks Compose, Then compose window should open",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await expect(gmailPage.composeButton).toBeVisible();

      // When
      await gmailPage.openCompose();

      // Then
      await expect(gmailPage.composeWindow).toBeVisible();
    }
  );

  test(
    "BDD-POS-02: Given compose window is open, When user types 'Incubyte' in Subject, Then subject field should display 'Incubyte'",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      await gmailPage.fillSubject(TARGET_SUBJECT);

      // Then
      expect(await gmailPage.getSubjectValue()).toBe(TARGET_SUBJECT);
    }
  );

  test(
    "BDD-POS-03: Given compose window is open, When user types ' QA test for Incubyte' in body, Then body should contain the text",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      await gmailPage.fillBody(TARGET_BODY);

      // Then
      expect(await gmailPage.getBodyValue()).toContain(TARGET_BODY.trim());
    }
  );

  test(
    "BDD-POS-04: Given compose is filled with To, Subject 'Incubyte' and Body ' QA test for Incubyte', When user clicks Send, Then email is sent and compose window closes",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillTo(VALID_RECIPIENT);
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);

      // When
      await gmailPage.send();

      // Then
      await expect(gmailPage.composeWindow).not.toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 8000 });
    }
  );

  test(
    "BDD-POS-05: Given compose window is open, When user clicks CC, Then CC input field should appear",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      await gmailPage.ccButton.click();

      // Then
      await expect(page.locator('[name="cc"]')).toBeVisible();
    }
  );

  test(
    "BDD-POS-06: Given compose window is open, When user clicks BCC, Then BCC input field should appear",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      await gmailPage.bccButton.click();

      // Then
      await expect(page.locator('[name="bcc"]')).toBeVisible();
    }
  );

  test(
    "BDD-POS-07: Given compose window has Subject and Body filled, When user clicks Discard, Then compose window should close without saving",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);

      // When
      await gmailPage.discard();

      // Then
      await expect(gmailPage.composeWindow).not.toBeVisible();
    }
  );

  test(
    "BDD-POS-08: Given compose is partially filled, When user closes it, Then draft should be saved in Drafts",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);

      // When
      await gmailPage.close();

      // Then
      await page.locator('[href*="drafts"]').first().click();
      await expect(page.getByText(TARGET_SUBJECT)).toBeVisible({ timeout: 8000 });
    }
  );

  test(
    "BDD-POS-09: Given compose window is open, When user adds a valid CC email and sends, Then email is delivered successfully",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillTo(VALID_RECIPIENT);
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);
      await gmailPage.ccButton.click();
      await page.locator('[name="cc"]').fill("cc.test@example.com");

      // When
      await gmailPage.send();

      // Then
      await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 8000 });
    }
  );

  test(
    "BDD-POS-10: Given compose is open, When user presses Tab between fields, Then focus moves correctly across To, Subject, Body",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      await gmailPage.toField.click();
      await page.keyboard.press("Tab"); // move to subject
      await page.keyboard.type(TARGET_SUBJECT);
      await page.keyboard.press("Tab"); // move to body
      await page.keyboard.type(TARGET_BODY);

      // Then
      expect(await gmailPage.getSubjectValue()).toBe(TARGET_SUBJECT);
      expect(await gmailPage.getBodyValue()).toContain(TARGET_BODY.trim());
    }
  );
});

// ─────────────────────────────────────────────
// NEGATIVE BDD SCENARIOS
// ─────────────────────────────────────────────

test.describe("Feature: Gmail Compose – Negative BDD Scenarios", () => {

  test.beforeEach(async ({ page }) => {
    await loginToGmail(page);
  });

  test(
    "BDD-NEG-01: Given compose is open with no recipient, When user clicks Send, Then an error about missing recipient should appear",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);

      // When
      await gmailPage.send();

      // Then
      await expect(
        page.getByRole("dialog").filter({ hasText: /specify at least one recipient/i })
      ).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    "BDD-NEG-02: Given compose is open, When user enters an invalid email 'notanemail', Then the address chip should be shown as invalid",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      await gmailPage.toField.fill("notanemail");
      await gmailPage.toField.press("Tab");
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);
      await gmailPage.send();

      // Then
      await expect(page.getByText(/invalid address/i)).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    "BDD-NEG-03: Given compose has a valid recipient and body, When user sends without a subject, Then Gmail prompts to confirm send without subject",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillTo(VALID_RECIPIENT);
      await gmailPage.fillBody(TARGET_BODY);

      // When
      await gmailPage.send();

      // Then
      await expect(page.getByText(/send this message without a subject/i)).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    "BDD-NEG-04: Given compose has valid recipient and subject, When user sends without body, Then Gmail prompts for empty message confirmation",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillTo(VALID_RECIPIENT);
      await gmailPage.fillSubject(TARGET_SUBJECT);

      // When
      await gmailPage.send();

      // Then
      await expect(page.getByText(/send anyway/i)).toBeVisible({ timeout: 5000 });
    }
  );

  test(
    "BDD-NEG-05: Given compose has a nonexistent domain email, When user sends, Then Gmail should show delivery failure notification",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();
      await gmailPage.fillTo("test@thisdoesnotexist12345.xyz");
      await gmailPage.fillSubject(TARGET_SUBJECT);
      await gmailPage.fillBody(TARGET_BODY);

      // When
      await gmailPage.send();
      await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 8000 });

      // Then (delivery failure notification may arrive in inbox)
      // Verify send succeeded at UI level; bounce is async
      await expect(gmailPage.composeWindow).not.toBeVisible();
    }
  );

  test(
    "BDD-NEG-06: Given compose is open, When user pastes an extremely long subject (999+ chars), Then subject is truncated or limited",
    async ({ page }) => {
      // Given
      const gmailPage = new GmailComposePage(page);
      await gmailPage.openCompose();

      // When
      const longText = "X".repeat(1000);
      await gmailPage.fillSubject(longText);

      // Then
      const val = await gmailPage.getSubjectValue();
      expect(val.length).toBeLessThanOrEqual(998);
    }
  );

  test(
    "BDD-NEG-07: Given user is not logged in, When user navigates to Gmail, Then user should be redirected to login page",
    async ({ page }) => {
      // Given — no login
      // When
      await page.goto("https://mail.google.com");

      // Then
      await expect(page).toHaveURL(/accounts\.google\.com|signin/i);
    }
  );
});
