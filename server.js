const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware to parse JSON and serve static files
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// GitHub configuration
const GITHUB_TOKEN = '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'; // Replace with your GitHub token
const GITHUB_REPO = 'upbram/myweb3'; // Replace with your GitHub username and repository name
const submissionsDir = path.join(__dirname, 'upbram', 'myweb3');
const submissionsFilePath = path.join(submissionsDir, 'submissions.json');

// Ensure the directory exists
if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir, { recursive: true }); // Create the directory if it doesn't exist
}

// POST route to handle form submissions
app.post("/submit-interest", async (req, res) => {
    const { project, email, painPoint } = req.body;
    const data = { project, email, painPoint, timestamp: new Date() };

    // Save data to submissions.json file
    fs.appendFile(submissionsFilePath, JSON.stringify(data) + "\n", async (err) => {
        if (err) {
            console.error("Error saving data:", err);
            return res.status(500).json({ message: "Error saving your interest." }); // Send JSON response
        }
        console.log("Data saved to submissions.json:", data); // Log the saved data

        // Update the file in GitHub
        try {
            const fileContent = fs.readFileSync(submissionsFilePath, 'utf8');
            console.log("File content to be uploaded:", fileContent); // Log the content being uploaded

            // Check if the file exists on GitHub
            const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/submissions.json`, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            const sha = response.data.sha; // Get the current SHA of the file
            console.log("Current SHA of the file:", sha); // Log the SHA

            // Create a commit to update the file
            await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/submissions.json`, {
                message: "Update submissions.json with new feedback",
                content: Buffer.from(fileContent).toString('base64'), // Encode the content in base64
                sha: sha, // Provide the SHA of the existing file
            }, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            res.status(200).json({ message: "Interest submitted successfully and saved to GitHub." }); // Send JSON response
        } catch (error) {
            console.error("Error updating GitHub file:", error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 404) {
                // If the file does not exist, create it
                try {
                    const fileContent = fs.readFileSync(submissionsFilePath, 'utf8');
                    await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/submissions.json`, {
                        message: "Create submissions.json with initial feedback",
                        content: Buffer.from(fileContent).toString('base64'), // Encode the content in base64
                    }, {
                        headers: {
                            Authorization: `token ${GITHUB_TOKEN}`,
                            Accept: 'application/vnd.github.v3+json',
                        },
                    });

                    res.status(200).json({ message: "Interest submitted successfully and file created in GitHub." }); // Send JSON response
                } catch (createError) {
                    console.error("Error creating GitHub file:", createError);
                    res.status(500).json({ message: "Error creating your interest in GitHub." }); // Send JSON response
                }
            } else {
                res.status(500).json({ message: "Error saving your interest to GitHub." }); // Send JSON response
            }
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});






  

  