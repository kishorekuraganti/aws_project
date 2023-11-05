const express = require("express");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 3000;

// Initialize AWS SDK automatically using the IAM role's permissions
AWS.config.update({ region: "us-east-1" }); // Replace with your DynamoDB region

const docClient = new AWS.DynamoDB.DocumentClient();

app.use(express.static("public"));

app.use(bodyParser.json());

const ejs = require("ejs");

app.set("view engine", "ejs");

// Define routes for your API

// index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// employee.ejs
app.get("/employe", (req, res) => {
  res.render("employe");
});

// manager.ejs
app.get("/manager", (req, res) => {
  const params = {
    TableName: "Tickets-Info", // Replace with your DynamoDB table name
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Error getting tickets:", err);
      res.status(500).json({ error: "Failed to get tickets" });
    } else {
      res.render("manager", { tickets: data.Items });
    }
  });
});

app.get("/employee/tickets", (req, res) => {
  const params = {
    TableName: "Tickets-Info", // Replace with your DynamoDB table name
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Error getting tickets:", err);
      res.status(500).json({ error: "Failed to get tickets" });
    } else {
      res.json(data.Items);
    }
  });
});

app.get("/manager/tickets", (req, res) => {
  const params = {
    TableName: "Tickets-Info", // Replace with your DynamoDB table name
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Error getting tickets:", err);
      res.status(500).json({ error: "Failed to get tickets" });
    } else {
      res.json(data.Items);
    }
  });
});

app.post("/employee/tickets", (req, res) => {
  const { title, status } = req.body;
  // Generate a unique identifier for Ticket_id
  const ticketId = uuidv4(); // This generates a random UUID

  const params = {
    TableName: "Tickets-Info",
    Item: { Ticket_id: ticketId, title, status }, // Include Ticket_id
  };

  docClient.put(params, (err) => {
    if (err) {
      console.error("Error creating a ticket:", err);
      res.status(500).json({ error: "Failed to create a ticket" });
    } else {
      res.json({ message: "Ticket created successfully" });
    }
  });
});

// Define a new route for marking a ticket as solved
app.put("/manager/tickets/:ticketId/mark-solved", (req, res) => {
  const ticketId = req.params.ticketId;

  // Update the ticket status in DynamoDB
  const params = {
    TableName: "Tickets-Info",
    Key: { Ticket_id: ticketId },
    UpdateExpression: "SET #status = :solved",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: { ":solved": "Solved" },
    ReturnValues: "UPDATED_NEW",
  };

  docClient.update(params, (err, data) => {
    if (err) {
      console.error("Error marking the ticket as solved:", err);
      res.status(500).json({ error: "Failed to mark the ticket as solved" });
    } else {
      res.status(200).json({ message: "Ticket marked as solved successfully" });
    }
  });
});
// Other routes and functionality can be added as needed

// ... (Your existing code)
// Serve the login.html file

// ... (Your other routes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
