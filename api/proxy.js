// api/proxy.js
const fetch = require("node-fetch"); // Import the 'node-fetch' package for HTTP requests

module.exports = async (req, res) => {
  try {
    // The URL of your local API
    const localApiUrl = `http://192.168.98.1:8091${req.url}`;

    // Fetch the data from your local API
    const apiResponse = await fetch(localApiUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method === "POST" ? req.body : undefined,
    });

    // Check if the request was successful
    if (!apiResponse.ok) {
      throw new Error(
        `Failed to fetch from the API: ${apiResponse.statusText}`
      );
    }

    // Return the response data back to the front-end
    const data = await apiResponse.json();

    // Send the data as the response with the correct content-type
    res.status(200).json(data);
  } catch (error) {
    // In case of an error, send the error response
    res.status(500).json({ error: error.message });
  }
};
