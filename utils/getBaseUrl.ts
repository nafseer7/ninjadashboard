export const getBaseUrl = async (): Promise<string> => {
    const localhostUrl = "http://localhost:3000";
    const ngrokUrl = "https://<YOUR_NGROK_URL>"; // Replace with your ngrok URL
  
    try {
      // Check if localhost is reachable
      const response = await fetch(localhostUrl, { method: "HEAD" });
      if (response.ok) {
        return localhostUrl;
      }
    } catch (error) {
      console.log("Localhost not reachable, falling back to ngrok URL.");
    }
  
    // Fallback to ngrok URL if localhost is not reachable
    return ngrokUrl;
  };
  