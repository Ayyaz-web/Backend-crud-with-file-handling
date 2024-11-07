const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3002;

app.use(express.json());

app.post("/", (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ error: "Email and token are required" });
  }

  const record = `${email},${token}\n`;

  fs.appendFile("db.txt", record, (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).json({ error: "Failed to store data" });
    }
    res.status(201).json({ message: "Data stored successfully", email, token });
  });
});

app.get("/retrieve-token", (req, res) => {
  const emailQuery = req.query.email;

  if (!emailQuery) {
    return res.status(400).json({ error: "Email query parameter is required" });
  }

  fs.readFile("db.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return res.status(500).json({ error: "Failed to read data" });
    }

    const lines = data.split("\n");
    for (let line of lines) {
      if (line) {
        const [email, token] = line.split(",");
        if (email === emailQuery) {
          return res.status(200).json({ token });
        }
      }
    }
    res.status(404).json({ error: "Email not found" });
  });
});

app.post("/delete", (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).json({ error: "Both Email and Token are required" });
  }

  fs.readFile("db.txt", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read data" });
    }

    const lines = data.split("\n");
    const updatedRecords = [];
    let recordDeleted = false;

    for (const line of lines) {
      if (line) {
        const [storedEmail, storedToken] = line.split(",");
        if (storedEmail === email && storedToken === token) {
          recordDeleted = true;
        } else {
          updatedRecords.push(line);
        }
      }
    }

    if (!recordDeleted) {
      return res.status(400).json({ error: "Email and Token do not match" });
    }

    fs.writeFile("db.txt", updatedRecords.join("\n"), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete record" });
      }
      res.status(200).json({ message: "Record deleted successfully" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
