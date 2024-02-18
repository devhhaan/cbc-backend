const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors middleware

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Connect to MongoDB (replace 'your_mongodb_uri' with your actual MongoDB connection string)
mongoose.connect(
  "mongodb+srv://devemahore:dev07dev@cluster0.efzljfo.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Define a schema for the data
const dataSchema = new mongoose.Schema({
  hemoglobin: Number,
  rbc: Number,
  wbc: Number,
  platelets: Number,
  date: String,
});
const bloodDataSchema = new mongoose.Schema({
  bloodTransfused: Number,
  date: String,
});
const plateletsTransfusedDataSchema = new mongoose.Schema({
  plateletsTransfused: Number,
  date: String,
});

// Create a model based on the schema
const Data = mongoose.model("Data", dataSchema);
const BloodData = mongoose.model("BloodData", bloodDataSchema);
const PlateletsTransfusedData = mongoose.model(
  "PlateletsTransfusedData",
  plateletsTransfusedDataSchema
);

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

function calculateDateDifference(apiDateStr) {
  // Convert the API date string to a Date object
  const apiDate = new Date(apiDateStr);
  console.log(apiDateStr);

  // Get the current date
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const dateDifference = currentDate - apiDate;

  // Convert the difference to days
  const daysDifference = Math.floor(dateDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

// Route to receive data from React and store it in MongoDB
app.post("/api/storeData", async (req, res) => {
  try {
    // Extract data from the request body
    const { hemoglobin, rbc, wbc, platelets, date } = req.body;

    // Create a new instance of the Data model with the received data
    const newData = new Data({
      hemoglobin,
      rbc,
      wbc,
      platelets,
      date,
    });
    console.log(newData);
    // Save the data to MongoDB
    await newData.save();

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/storeData/bloodTransfused", async (req, res) => {
  try {
    // Extract data from the request body
    const { bloodTransfused, date } = req.body;

    // Create a new instance of the Data model with the received data
    const newData = new BloodData({ bloodTransfused, date });
    console.log(newData);
    // Save the data to MongoDB
    await newData.save();

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/storeData/plateletesTransfused", async (req, res) => {
  try {
    // Extract data from the request body
    const { plateletsTransfused, date } = req.body;

    // Create a new instance of the Data model with the received data
    const newData = new PlateletsTransfusedData({ plateletsTransfused, date });
    console.log(newData);
    // Save the data to MongoDB
    await newData.save();

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get hemoglobin data
app.get("/api/getHemoglobinData", async (req, res) => {
  try {
    const hemoglobinData = await Data.find({}, { hemoglobin: 1, date: 1 });
    res.status(200).json(hemoglobinData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get bloodTransfused data
app.get("/api/getBloodTransfusedData", async (req, res) => {
  try {
    const bloodTransfused = await BloodData.find(
      {},
      { bloodTransfused: 1, date: 1 }
    );
    res.status(200).json(bloodTransfused);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get plateletsTransfused data
app.get("/api/getPlateletsTransfusedData", async (req, res) => {
  try {
    const plateletsTransfused = await PlateletsTransfusedData.find(
      {},
      { plateletsTransfused: 1, date: 1 }
    );
    res.status(200).json(plateletsTransfused);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get totalBloodCount data
app.get("/api/getTotalBloodCountData", async (req, res) => {
  try {
    const totalBloodCount = await BloodData.aggregate([
      {
        $group: {
          _id: null,
          totalBloodCount: {
            $sum: "$bloodTransfused",
          },
        },
      },
    ]);
    res.status(200).json(totalBloodCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get totalPlateletsCount data
app.get("/api/getTotalPlateletsCountData", async (req, res) => {
  try {
    const totalPlateletsCount = await PlateletsTransfusedData.aggregate([
      {
        $group: {
          _id: null,
          totalPlateletsCount: {
            $sum: "$plateletsTransfused",
          },
        },
      },
    ]);
    res.status(200).json(totalPlateletsCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get freeFromBloodTransfusionFrom data
app.get("/api/getFreeFromBloodTransfusionFromData", async (req, res) => {
  try {
    const freeFromBloodTransfusionFrom = await BloodData.aggregate([
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
  
    const apiDateStr = freeFromBloodTransfusionFrom[0].date;
    // Calculate the difference in days
    const differenceInDays = calculateDateDifference(apiDateStr);

    res.status(200).json({ 'bloodLasts': differenceInDays});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get freeFromPlateletTransfusionFrom data
app.get("/api/getFreeFromPlateletTransfusionFromData", async (req, res) => {
  try {
    const freeFromPlateletTransfusionFrom = await PlateletsTransfusedData.aggregate([
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
  
    const apiDateStr = freeFromPlateletTransfusionFrom[0].date;
    // Calculate the difference in days
    const differenceInDays = calculateDateDifference(apiDateStr);

    res.status(200).json({ 'plateletLasts': differenceInDays});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get rbc data
app.get("/api/getRbcData", async (req, res) => {
  try {
    const rbcData = await Data.find({}, { rbc: 1, date: 1 });
    res.status(200).json(rbcData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get wbc data
app.get("/api/getWbcData", async (req, res) => {
  try {
    const wbcData = await Data.find({}, { wbc: 1, date: 1 });
    res.status(200).json(wbcData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to get platelets data
app.get("/api/getPlateletsData", async (req, res) => {
  try {
    const plateletsData = await Data.find({}, { platelets: 1, date: 1 });
    res.status(200).json(plateletsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
