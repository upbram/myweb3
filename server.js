const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Access the token from environment variables 
const GITHUB_REPO = 'upbram/myweb3'; // Replace with your GitHub username and repository name

// POST route to handle form submissions
app.post("/submit-interest", async (req, res) => {
    const { project, email, painPoint } = req.body;
    const newData = { project, email, painPoint, timestamp: new Date() };

    // Prepare the content to be appended
    const newContent = JSON.stringify(newData) + "\n"; // New data to append

    try {
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
        if (error.response && error.response.status === 404) {
            // If the file does not exist, create it with the new data
            try {
                await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/submissions.json`, {
                    message: "Create submissions.json with initial feedback",
                    content: Buffer.from(newContent).toString('base64'), // Use the base64 encoded content
                }, {
                    headers: {
                        Authorization: `token ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                });

                res.status(200).json({ message: "Interest submitted successfully and file created in GitHub." }); // Send JSON response
            } catch (createError) {
                console.error("Error creating GitHub file:", createError.response ? createError.response.data : createError.message);
                res.status(500).json({ message: "Error creating your interest in GitHub." }); // Send JSON response
            }
        } else {
            res.status(500).json({ message: "Error saving your interest to GitHub." }); // Send JSON response
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});






  

  