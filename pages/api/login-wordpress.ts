import puppeteer from 'puppeteer';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST instead.' });
  }

  const { siteUrl, username, password } = req.body;

  if (!siteUrl || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields: siteUrl, username, or password.' });
  }

  try {
    // Validate and normalize siteUrl
    let sanitizedUrl = siteUrl.trim();
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      sanitizedUrl = 'http://' + sanitizedUrl; // Default to HTTP if no protocol is provided
    }

    // Check if the URL is valid
    try {
      new URL(sanitizedUrl); // Throws an error if the URL is invalid
    } catch (error) {
      return res.status(400).json({ message: 'Invalid site URL provided.' });
    }

    // Construct the login URL
    const loginUrl = `${sanitizedUrl}/wp-login.php`;

    // Launch Puppeteer in non-headless mode
    const browser = await puppeteer.launch({
      headless: false, // Set to false to open the browser for user interaction
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'], // Maximize window
      defaultViewport: null, // Use full-screen mode
    });

    // Create a new page
    const page = await browser.newPage();

    // Navigate to the login page
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });

    // Inject username and password
    await page.type('#user_login', username.trim());
    await page.type('#user_pass', password.trim());

    // Submit the form
    await Promise.all([
      page.click('#wp-submit'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('#wp-admin-bar-my-account'); // Check for WordPress admin bar
    });

    if (isLoggedIn) {
      console.log('Login successful. Staying on the current tab for manual interaction.');
      return res.status(200).json({ message: 'Login successful. You can now manually interact with the open browser.' });
    } else {
      console.log('Login failed. Staying on the current tab for debugging.');
      return res.status(401).json({ message: 'Login failed. Please check your credentials. The browser is still open.' });
    }

    // DO NOT CLOSE the browser
    // Puppeteer will keep the browser and tab open for manual interaction.
  } catch (error) {
    console.error('Error in Puppeteer automation:', error);

    if (error instanceof Error) {
      return res.status(500).json({ message: 'An error occurred during the login process.', error: error.message });
    }

    return res.status(500).json({ message: 'An unknown error occurred during the login process.' });
  }
}
