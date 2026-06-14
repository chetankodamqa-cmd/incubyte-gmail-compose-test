/**
 * Traditional Style Test Cases
 * Feature: Gmail Compose - Send email with subject "Incubyte" and body " QA test for Incubyte"
 *
 * Prerequisites:
 *  - Gmail account credentials stored in environment variables:
 *    GMAIL_USER, GMAIL_PASS
 *  - Run: npx playwright test tests/traditional.test.ts
 */

import { test, expect, Page } from "@playwright/test";
import { GmailComposePage } from "../pages/GmailComposePage";

const TARGET_SUBJECT = "Incubyte";
const TARGET_BODY = " QA test for Incubyte";

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
// POSITIVE TEST CASES
// ─────────────────────────────────────────────

test.describe("TC-POS: Gmail Compose – Positive Scenarios", () => {

  test.beforeEach(async ({ page }) => {
    await loginToGmail(page);
  });

  test("TC-POS-01: Compose window opens on clicking Compose button", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await expect(gmailPage.composeWindow).toBeVisible();
  });

  test("TC-POS-02: User can type subject 'Incubyte' in subject field", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillSubject(TARGET_SUBJECT);
    expect(await gmailPage.getSubjectValue()).toBe(TARGET_SUBJECT);
  });

  test("TC-POS-03: User can type body ' QA test for Incubyte' in message body", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillBody(TARGET_BODY);
    expect(await gmailPage.getBodyValue()).toContain(TARGET_BODY.trim());
  });

  test("TC-POS-04: User can add a valid recipient email address", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillTo("qa.test.incubyte@gmail.com");
    await expect(gmailPage.toField).not.toHaveValue("qa.test.incubyte@gmail.com"); // chip created
    await expect(page.locator('[data-hovercard-id="qa.test.incubyte@gmail.com"]')).toBeVisible();
  });

  test("TC-POS-05: Send button is enabled when To, Subject and Body are filled", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillTo("qa.test.incubyte@gmail.com");
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await expect(gmailPage.sendButton).toBeEnabled();
  });

  test("TC-POS-06: Email is sent successfully and compose window closes", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillTo("qa.test.incubyte@gmail.com");
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await gmailPage.send();
    await expect(gmailPage.composeWindow).not.toBeVisible({ timeout: 10000 });
    // Confirm "Message sent" toast
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 8000 });
  });

  test("TC-POS-07: Subject field accepts special characters alongside 'Incubyte'", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    const specialSubject = "Incubyte - QA#2024!";
    await gmailPage.fillSubject(specialSubject);
    expect(await gmailPage.getSubjectValue()).toBe(specialSubject);
  });

  test("TC-POS-08: Compose window can be minimized and restored", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    const minimizeBtn = page.locator('[aria-label="Minimize"]').last();
    await minimizeBtn.click();
    await expect(gmailPage.composeWindow).not.toBeVisible();
    // Click taskbar to restore
    await page.locator('.dw .nH').last().click();
    await expect(gmailPage.composeWindow).toBeVisible();
  });

  test("TC-POS-09: CC field becomes visible when CC button is clicked", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.ccButton.click();
    await expect(page.locator('[name="cc"]')).toBeVisible();
  });

  test("TC-POS-10: BCC field becomes visible when BCC button is clicked", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.bccButton.click();
    await expect(page.locator('[name="bcc"]')).toBeVisible();
  });

  test("TC-POS-11: Compose window closes and draft is discarded via Discard button", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await gmailPage.discard();
    await expect(gmailPage.composeWindow).not.toBeVisible();
  });

  test("TC-POS-12: Draft is saved when compose window is closed without sending", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await gmailPage.close();
    // Draft should appear in Drafts folder
    await page.locator('[href*="drafts"]').first().click();
    await expect(page.getByText(TARGET_SUBJECT)).toBeVisible({ timeout: 8000 });
  });
});

// ─────────────────────────────────────────────
// NEGATIVE TEST CASES
// ─────────────────────────────────────────────

test.describe("TC-NEG: Gmail Compose – Negative Scenarios", () => {

  test.beforeEach(async ({ page }) => {
    await loginToGmail(page);
  });

  test("TC-NEG-01: Send button does not send when To field is empty", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await gmailPage.send();
    // Expect error dialog or compose window to remain open
    const errorDialog = page.getByRole("dialog").filter({ hasText: /specify at least one recipient/i });
    await expect(errorDialog).toBeVisible({ timeout: 5000 });
  });

  test("TC-NEG-02: Invalid email format in To field shows error", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.toField.fill("notanemail");
    await gmailPage.toField.press("Tab");
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await gmailPage.send();
    await expect(page.getByText(/invalid address/i)).toBeVisible({ timeout: 5000 });
  });

  test("TC-NEG-03: Sending with empty subject shows confirmation prompt", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillTo("qa.test.incubyte@gmail.com");
    await gmailPage.fillBody(TARGET_BODY);
    // Leave subject empty
    await gmailPage.send();
    await expect(page.getByText(/send this message without a subject/i)).toBeVisible({ timeout: 5000 });
  });

  test("TC-NEG-04: Sending with empty body shows confirmation prompt", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillTo("qa.test.incubyte@gmail.com");
    await gmailPage.fillSubject(TARGET_SUBJECT);
    // Leave body empty
    await gmailPage.send();
    await expect(page.getByText(/send this message without a subject|send anyway/i)).toBeVisible({ timeout: 5000 });
  });

  test("TC-NEG-05: Multiple invalid recipients are highlighted with error", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.toField.fill("bad1@@test.com");
    await gmailPage.toField.press("Enter");
    await gmailPage.toField.fill("bad2#email");
    await gmailPage.toField.press("Tab");
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    await gmailPage.send();
    await expect(page.getByText(/invalid address/i)).toBeVisible({ timeout: 5000 });
  });

  test("TC-NEG-06: Subject field does not accept more than 998 characters (RFC limit)", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    const longSubject = "A".repeat(999);
    await gmailPage.fillSubject(longSubject);
    const value = await gmailPage.getSubjectValue();
    expect(value.length).toBeLessThanOrEqual(998);
  });

  test("TC-NEG-07: Closing browser tab mid-compose saves draft", async ({ page }) => {
    const gmailPage = new GmailComposePage(page);
    await gmailPage.openCompose();
    await gmailPage.fillSubject(TARGET_SUBJECT);
    await gmailPage.fillBody(TARGET_BODY);
    // Simulate navigation away
    await page.goto("https://mail.google.com/#inbox");
    await page.goBack();
    await page.locator('[href*="drafts"]').first().click();
    await expect(page.getByText(TARGET_SUBJECT)).toBeVisible({ timeout: 8000 });
  });
});
