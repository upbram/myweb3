const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware to parse JSON and serve static files
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// POST route to handle form submissions
app.post("/submit-interest", (req, res) => {
    const { project, email, painPoint } = req.body;
    const data = { project, email, painPoint, timestamp: new Date() };

    // Save data to a file (or you could use a database)
    fs.appendFile("submissions.json", JSON.stringify(data) + "\n", (err) => {
        if (err) {
            console.error("Error saving data:", err);
            return res.status(500).json({ message: "Error saving your interest." });
        }
        console.log("Data saved successfully:", data);
        res.status(200).json({ message: "Interest submitted successfully." });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
