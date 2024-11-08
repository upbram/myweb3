require('dotenv').config(); // Load environment variables from .env file
const axios = require("axios");

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { project, email, painPoint } = req.body;
        const newData = { project, email, painPoint, timestamp: new Date() };

        // Prepare the content to be appended
        const newContent = JSON.stringify(newData) + "\n"; // New data to append

        try {
            const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Access the token from environment variables
            const GITHUB_REPO = 'upbram/myweb3'; // Replace with your GitHub username and repository name

            // Check if the file exists on GitHub
            const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/submissions.json`, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            const sha = response.data.sha; // Get the current SHA of the file
            const existingContent = Buffer.from(response.data.content, 'base64').toString('utf8'); // Decode existing content
            const updatedContent = existingContent + newContent; // Append new data to existing content

            // Create a commit to update the file
            await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/submissions.json`, {
                message: "Append new feedback to submissions.json",
                content: Buffer.from(updatedContent).toString('base64'), // Encode the updated content in base64
                sha: sha, // Provide the SHA of the existing file
            }, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            res.status(200).json({ message: "Interest submitted successfully and appended to GitHub." }); // Send JSON response
        } catch (error) {
            console.error("Error updating GitHub file:", error.response ? error.response.data : error.message);
            res.status(500).json({ message: "Error saving your interest to GitHub.", error: error.message }); // Send JSON response with error details
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};






  

  
