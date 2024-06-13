const fs = require('fs');
const puppeteer = require('puppeteer');

// Read token from input.txt
const input = fs.readFileSync('input.txt', 'utf8');
const [email, password, token] = input.split('\n');

// Login to Discord with token
async function loginDiscord(token) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://discord.com/login');
  await page.evaluate(token => {
    document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage.token = `"${token}"`;
  }, token);
  await page.waitForTimeout(2500);
  await page.reload();
  await browser.close();
}

// Change email on Discord account
async function changeEmail(page, email) {
  await page.goto('https://discord.com/settings/account');
  await page.click('button[aria-label="Edit"]');
  await page.fill('input[name="email"]', email);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

// Send verification email
async function sendVerificationEmail(page) {
  await page.goto('https://discord.com/settings/account');
  await page.click('button[aria-label="Resend Email"]');
  await page.waitForTimeout(2000);
}

// Login to email account
async function loginEmail(email, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`https://mail.${email.split('@')[1]}`);
  await page.fill('input[name="username"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await browser.close();
}

// Verify Discord ID
async function verifyDiscordID(page) {
  await page.goto('https://discord.com/settings/account');
  const discordId = await page.$eval('div[aria-label="User ID"]', el => el.textContent);
  console.log(`Verified Discord ID: ${discordId}`);
}

// Main script
async function main() {
  await loginDiscord(token);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await changeEmail(page, email);
  await sendVerificationEmail(page);
  await loginEmail(email, password);
  await verifyDiscordID(page);
  await browser.close();
}

main();
