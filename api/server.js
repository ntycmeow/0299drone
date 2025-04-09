const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const fetch = require("node-fetch");

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "../public")));


const corsOption = {
  origin: "*",
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOption));

const droneConfigServer = async () => {
  const response = await fetch(
    "https://script.googleusercontent.com/a/macros/kmitl.ac.th/echo?user_content_key=rkqt64F98HmsGGjX2omaeGSbyw13_YduQeSaGEF0lB7bHzbANljxz4jX2CjwchWaJrCKMbK5LgUTYZydYY5kU4T6vCJmz6mFOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMi80zadyHLKDKZjKBq1Xc9sWoyaHaoG5vh0lmODcuY_2rPTzpFsAmwnwBhSVRI2rMiUit7buCxwbDz0ZDYFmx5Dfj1A6aFLizxS6unfEF1TdEuLOvZLaRR0R2bQ-0Q7TZ97gfP5tp1cY&lib=M9_yccKOaZVEQaYjEvK1gClQlFAuFWsxN"
  );
  const dummyDb = await response.json();
  return dummyDb;
};

const droneLogServer = async () => {
  const response = await fetch(
    "https://app-tracking.pockethost.io/api/collections/drone_logs/records"
  );
  const dummyDb = await response.json();
  return dummyDb;
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "view.html"));
});

const getAllConfigs = async (req, res) => {
  try {
    const dummyDb = await droneConfigServer();
    let result = [];

    dummyDb.data.forEach((drone) => {
      result.push({
        drone_id: drone.drone_id,
        drone_name: drone.drone_name,
        light: drone.light,
        country: drone.country,
        weight: drone.weight,
      });
    });

    if (result.length > 0) {
      return res.status(200).json({
        status: "success",
        data: result,
      });
    } else {
      return res.status(404).json({
        status: "failed",
        message: "No drones found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const getConfigs = async (req, res) => {
  try {
    const dummyDb = await droneConfigServer();
    const droneData = dummyDb.data.find(
      (drone) => drone.drone_id == req.params.id
    );

    if (droneData) {
      const data = {
        drone_id: droneData.drone_id,
        drone_name: droneData.drone_name,
        light: droneData.light,
        country: droneData.country,
        weight: droneData.weight,
      };

      return res.status(200).json({
        status: "success",
        data: data,
      });
    } else {
      return res.status(404).json({
        status: "failed",
        message: "Drone not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const getStatus = async (req, res) => {
  try {
    const dummyDb = await droneConfigServer();
    const droneData = dummyDb.data.find(
      (drone) => drone.drone_id == req.params.id
    );

    if (droneData) {
      const data = {
        condition: droneData.condition,
      };

      return res.status(200).json({
        status: "success",
        data: data,
      });
    } else {
      return res.status(404).json({
        status: "failed",
        message: "Drone not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const getLogs = async (req, res) => {
  try {
    const dummyDb = await droneLogServer();

    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(dummyDb.perPage);
    const totalPages = parseInt(dummyDb.totalPages);

    if (page > totalPages) {
      return res.status(404).json({
        status: "failed",
        message: "Page not found",
      });
    }

    const response = await fetch(
      `https://app-tracking.pockethost.io/api/collections/drone_logs/records?page=${page}`
    );
    const dataResponse = await response.json();

    const logs = dataResponse.items.map((log) => ({
      drone_id: log.drone_id,
      drone_name: log.drone_name,
      light: log.light,
      country: log.country,
      celsius: log.celsius,
      created: log.created,
    }));

    return res.status(200).json({
      status: "success",
      currentPage: page,
      totalPages,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};

const postLogs = async (req, res) => {
  try {
    const logData = req.body;

    const response = await fetch(
      "https://app-tracking.pockethost.io/api/collections/drone_logs/records",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 20250301efx",
        },
        body: JSON.stringify({
          drone_id: String(logData.drone_id),
          drone_name: logData.drone_name,
          country: logData.country,
          celsius: logData.celsius,
        }),
      }
    );

    const postLog = await response.json();

    if (response.ok) {
      return res.status(200).json({
        status: "success",
        data: postLog,
      });
    } else {
      return res.status(response.status).json({
        status: "failed",
        message:
          postLog.message ||
          `Failed to create log (Status: ${response.status})`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: `Server error: ${error.message}`,
    });
  }
};

app.get("/config", getAllConfigs);
app.get("/config/:id", getConfigs);
app.get("/configStatus/:id", getStatus);
app.get("/logs", getLogs);
app.post("/logs", postLogs);
app.get("/env", (req, res) => {
  res.json({ drone_id: process.env.DRONE_ID }); // 👈 ตัวเล็ก
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

module.exports = app;