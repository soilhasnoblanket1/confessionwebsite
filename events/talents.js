// routes/api/posts.js
const express = require('express');
const app = express.Router();
const path = require('path')

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "html", "talents", "talents.html"));
  });

  app.get("/music", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "html", "talents", "talent-song.html"));
  });



app.get("/poetry", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "html", "talents", "talent-poetry.html"));
  });

  app.get("/photography", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "html", "talents", "talent-photography.html"));
  });

  app.get("/art", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "html", "talents", "talent-art.html"));
  });
module.exports = app;