// routes/api/posts.js
const express = require("express");
const app = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");

const Confession = require("../models/confession.js");
const https = require("https");

const rateLimit = {};

function rateLimitMiddleware(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!rateLimit[ip]) {
    rateLimit[ip] = Date.now();
    return next();
  }

  const timeDifference = Date.now() - rateLimit[ip];
  if (timeDifference < 30000) {
    return res.redirect("/static/err401");
  }

  rateLimit[ip] = Date.now();
  next();
}

app.post("/submit", rateLimitMiddleware, (req, res) => {
  const confession = req.body.confession;
  const nickname = req.body.nickname;
  const gRecaptchaResponse = req.body['g-recaptcha-response'];

  // Validate the reCAPTCHA response
  const secretKey = "6Lctj88pAAAAAGyzTC_8J8qN-VLy_ST-EZnk0-dh";
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
  const formData = `secret=${secretKey}&response=${gRecaptchaResponse}`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(formData),
    },
  };

  const request = https.request(verifyUrl, options, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });
    response.on("end", () => {
      const jsonData = JSON.parse(data);
      if (!jsonData.success) {
        return res.status(400).json({ error: "Invalid reCAPTCHA response" });
      }

      // If the reCAPTCHA response is valid, proceed with the rest of the code
      const newConfession = new Confession({
        confession: confession,
        nickname: nickname,
      });

      newConfession
      .save()
      .then((confession) => {
          res.redirect(
            "/api/submitted?confession=" +
              encodeURIComponent(JSON.stringify(confession)),
          );
        })
      .catch((err) => {
          console.error(err);
          res
          .status(500)
          .json({ error: "An error occurred while saving the confession" });
        });
    });
  });

  request.write(formData);
  request.end();
});
app.get("/submitted", (req, res) => {
  // Retrieve the confession data from the query string
  const confession = JSON.parse(decodeURIComponent(req.query.confession));

  // Generate an encrypted confession code
  const encryptedConfessionCode = encryptConfessionCode(confession._id);

  res.render("submission", { confession: confession, encryptedConfessionCode }); // Render the submitted template with the confession data and encrypted confession code
});

function encryptConfessionCode(confessionId) {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.SECRET_KEY);
  let encrypted = cipher.update(confessionId.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

//...

app.post("/deleteconf", (req, res) => {
  const encryptedConfessionId = req.body.objectId; // Get the encrypted confession ID from the request body

  // Decrypt the confession ID
  const confessionId = decryptConfessionCode(encryptedConfessionId);

  // Log the confessionId value
  console.log("Confession ID:", confessionId);

  // Find and delete the confession by ID
  Confession.findByIdAndDelete(confessionId)
  .then(() => {
      res.redirect("/static/deleted");
    })
  .catch((err) => {
      console.error(err);
      res.redirect("/static/err400");
    });
});
//...

function decryptConfessionCode(encryptedId) {
  const decipher = crypto.createDecipher("aes-256-cbc", process.env.SECRET_KEY);
  let decrypted = "";

  try {
    decrypted = decipher.update(encryptedId, "hex", "utf8");
    decrypted += decipher.final("utf8");
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }

  return decrypted;
}

app.post("/delete/:id", async (req, res) => {
  try {
    const confessionId = req.params.id;

    // Find the confession in the Confession collection and delete it
    const confession = await Confession.findByIdAndDelete(confessionId);

    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    res.redirect("/bin/cementglazeddoughnuts/adminpanel");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = app;
