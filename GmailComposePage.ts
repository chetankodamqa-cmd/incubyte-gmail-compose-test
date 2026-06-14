import { Page, Locator } from "@playwright/test";

export class GmailComposePage {
  readonly page: Page;

  readonly composeButton: Locator;
  readonly toField: Locator;
  readonly subjectField: Locator;
  readonly bodyField: Locator;
  readonly sendButton: Locator;
  readonly composeWindow: Locator;
  readonly closeButton: Locator;
  readonly discardButton: Locator;
  readonly ccButton: Locator;
  readonly bccButton: Locator;
  readonly attachButton: Locator;
  readonly subjectInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.composeButton = page.getByRole("button", { name: /compose/i });
    this.composeWindow = page.locator('[role="dialog"]').filter({ hasText: "New Message" });
    this.toField = page.locator('[name="to"]');
    this.subjectField = page.locator('[name="subjectbox"]');
    this.bodyField = page.locator('[aria-label="Message Body"]');
    this.sendButton = page.getByRole("button", { name: /send/i }).last();
    this.closeButton = page.locator('[aria-label="Close"]').last();
    this.discardButton = page.locator('[aria-label="Discard draft"]');
    this.ccButton = page.locator('[aria-label="Add Cc recipients"]');
    this.bccButton = page.locator('[aria-label="Add Bcc recipients"]');
    this.attachButton = page.locator('[aria-label="Attach files"]');
    this.subjectInput = page.locator('input[name="subjectbox"]');
  }

  async goto() {
    await this.page.goto("https://mail.google.com");
  }

  async openCompose() {
    await this.composeButton.click();
    await this.composeWindow.waitFor({ state: "visible" });
  }

  async fillTo(email: string) {
    await this.toField.fill(email);
    await this.toField.press("Tab");
  }

  async fillSubject(subject: string) {
    await this.subjectField.fill(subject);
  }

  async fillBody(body: string) {
    await this.bodyField.click();
    await this.bodyField.fill(body);
  }

  async send() {
    await this.sendButton.click();
  }

  async discard() {
    await this.discardButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  async isComposeWindowVisible(): Promise<boolean> {
    return await this.composeWindow.isVisible();
  }

  async getSubjectValue(): Promise<string> {
    return await this.subjectField.inputValue();
  }

  async getBodyValue(): Promise<string> {
    return await this.bodyField.innerText();
  }
}
