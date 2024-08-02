const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;
app.use(express.json());

let db;
MongoClient.connect(databaseURL)
  .then((client) => {
    db = client.db(process.env.DATABASE_NAME);
  })
  .catch((error) => {
    console.log(error);
  });
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

app.listen(port);

app.post("/users", (req, res) => {
  const data = req.body;
  db.collection("user")
    .insertOne(data)
    .then((result) => {
      if (result.acknowledged) {
        console.log("Inserted document:", result.insertedId);
        res.status(200).json({ _id: result.insertedId, ...data });
      } else {
        res.status(500).json({ error: "Failed to insert document" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "somethis is wrong" });
    });
});

app.get("/users", (req, res) => {
  db.collection("user")
    .find({})
    .toArray()
    .then((result) => {
      res.status(200).json({ success: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "somethis is wrong" });
    });
});

// ---------------------- Deployment ------------

//------------------------Deployment ------------

app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  db.collection("user")
    .updateOne({ _id: new ObjectId(id) }, { $set: updatedData })
    .then((result) => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ message: "Document updated successfully" });
    })
    .catch((error) => {
      console.error("Error updating data:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the document" });
    });
});

app.delete("/users/:id", (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  db.collection("user")
    .deleteOne({ _id: new ObjectId(id) })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json({ message: "Document deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting user", error);
      res.status(500).json({ error: "Something went wrong!!!" });
    });
});

app.delete("/users", (req, res) => {
  const ids = req.body.ids;

  if (!Array.isArray(ids) || ids.some((id) => !ObjectId.isValid(id))) {
    return res.status(400).json({ error: "Invalid IDs provided" });
  }

  const userIds = ids.map((id) => new ObjectId(id));

  db.collection("user")
    .deleteMany({ _id: { $in: userIds } })
    .then((result) => {
      res.json({ message: "Users deleted successfully" });
    })
    .catch((error) => {
      console.error("Error deleting users", error);
      res.status(500).json({ error: "Something went wrong!!!" });
    });
});
