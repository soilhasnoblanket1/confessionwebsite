const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const Confession = require("../models/confession.js");
const path = require("path");

app.get("/", (req, res) => {
  Confession.find().then((confessions) => {

    function formatTimeDifference(date) {
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffDay > 0) {
        return `${diffDay} days ago`;
      } else if (diffHr > 0) {
        return `${diffHr} hours ago`;
      } else if (diffMin > 0) {
        return `${diffMin} minutes ago`;
      } else {
        return `a few seconds ago`;
      }
    }
    res.render("index", {
      confessions: confessions,
      formatTimeDifference,
    });
  });
});

app.get("/sabal", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "html", "sabal.html"));
});

app.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "html", "game.html"));
});

app.get("/nav", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "html", "nav.html"));
});

app.get("/static/deleted", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "error", "deleted.html"));
});

app.get("/static/errcaptcha", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "error", "errcaptcha.html"));
});

app.get("/static/tos", (req, res) => {
  res.render("tos");
});

app.get("/static/err400", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "error", "error400.html"));
});

app.get("/static/err401", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "error", "toomanyrequest.html"));
});

app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://sauravlovesampada:coffeelover123@sauravdonkey.pbt6v.mongodb.net/?retryWrites=true&w=majority&appName=sauravdonkey",
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//
app.get("/deleteconfession", (req, res) => {
  Confession.find().then((confessions) => {
    res.render("delete", { confessions: confessions });
  });
});

function formatTimeDifference(createdAt) {
  const currentTime = new Date();
  const timeDifference = currentTime - createdAt;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds > 1? 's' : ''} ago`;
  }
}

app.get("/feed", (req, res) => {
  Confession.find().then((confessions) => {

    function formatTimeDifference(date) {
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffDay > 0) {
        return `${diffDay} days ago`;
      } else if (diffHr > 0) {
        return `${diffHr} hours ago`;
      } else if (diffMin > 0) {
        return `${diffMin} minutes ago`;
      } else {
        return `a few seconds ago`;
      }
    }
    res.render("feed", {
      confessions: confessions,
      formatTimeDifference,
    });
  });
});

app.get("/bin/cementglazeddoughnuts/adminpanel", (req, res) => {
  Confession.find()
   .then((confessions) => {
      res.render("admin", { 
        confessions: confessions,
        formatTimeDifference,
      });
    })
   .catch((err) => {
      console.error(err);
      res
       .status(500)
       .json({ error: "An error occurred while fetching confessions" });
    });
});

app.get("/panel/cred123456/backup", (req, res) => {
  ConfessionBackup.find()
    .then((confessions) => {
      res.render("backup", { confessions: confessions });
    })
    .catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching confessions" });
    });
});

module.exports = app;
