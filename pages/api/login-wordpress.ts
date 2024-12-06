export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed. Use POST instead.' });
  }

  const { siteUrl, username, password } = req.body;

  if (!siteUrl || !username || !password) {
    return res.status(400).json({ message: 'Missing required fields: siteUrl, username, or password.' });
  }

  try {
    // Validate and normalize the siteUrl
    let sanitizedUrl = siteUrl.trim();
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      sanitizedUrl = 'http://' + sanitizedUrl;
    }

    // Check if the URL is valid
    try {
      new URL(sanitizedUrl); // Throws an error if the URL is invalid
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: 'Invalid site URL provided.', error: error.message });
      }
      return res.status(400).json({ message: 'Invalid site URL provided.' });
    }

    // Construct the login URL
    const loginUrl = `${sanitizedUrl}/wp-login.php?log=${encodeURIComponent(username)}&pwd=${encodeURIComponent(password)}`;

    return res.status(200).json({ loginUrl });
  } catch (error) {
    console.error('Error generating login URL:', error);

    // Safely handle unknown error type
    if (error instanceof Error) {
      return res.status(500).json({ message: 'An error occurred.', error: error.message });
    }

    // Fallback for unexpected cases
    return res.status(500).json({ message: 'An unknown error occurred.' });
  }
}