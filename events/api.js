// routes/api/posts.js
const express = require("express");
const app = express.Router();
const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");
const axios = require('axios');
const Coin = require('../models/coin.js');
const Confession = require("../models/confession.js");
const RateLimit = require("../models/limit.js");
const https = require("https");

async function rateLimitMiddleware(req, res, next) {
  const ipAddress = req.headers["x-forwarded-for"].split(',')[0].trim() || req.connection.remoteAddress;

  try {
    const vpnCheckUrl = `https://vpnapi.io/api/${ipAddress}?key=9700a80a63c3490a813371c58034ad7f`;
    const vpnCheckResponse = await axios.get(vpnCheckUrl);
    const vpnData = vpnCheckResponse.data;

    if (vpnData.security.vpn === true) {
      req.vpnDetected = true; // Set the req.vpnDetected property to true
      return res.redirect('/static/vpnblock');
    } else {
      req.vpnDetected = false; 
    }
    const doc = await RateLimit.findOne({ ip: ipAddress }).exec();

    console.log(`Rate limit check for IP ${ipAddress}:`);

    if (!doc) {
      const newDoc = new RateLimit({ ip: ipAddress, count: 0, timestamp: Date.now() });
      await newDoc.save();
      console.log(`Created new RateLimit document for IP ${ipAddress}`);
      return next();
    } else {
      const currentTime = Date.now();
      const timeDifference = currentTime - doc.timestamp;

      if (timeDifference >= 3600000) { 
        const pastHourDocs = await RateLimit.find({ ip: ipAddress, timestamp: { $gte: currentTime - 3600000 } });
        if (pastHourDocs.length >= 3) {
          console.log(`Rate limit exceeded for IP ${ipAddress} in the past hour. Redirecting to /static/err401`);
          return res.redirect("/static/vpnblock");
        } else {
          doc.count = 0;
          doc.timestamp = currentTime;
          console.log(`Reset rate limit for IP ${ipAddress} after 1 hour`);
        }
      }

      if (doc.count >= 3) {
        console.log(`Rate limit exceeded for IP ${ipAddress}. Redirecting to /static/err401`);
        return res.redirect("/static/err401");
      }

      doc.count++;
      await doc.save();
      console.log(`Updated rate limit for IP ${ipAddress}. Count: ${doc.count}`);
      return next();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  next();
}

app.post("/submit", rateLimitMiddleware, (req, res) => {
  const confession = req.body.confession;
  const nickname = req.body.nickname;
  const ipAddress = req.headers["x-forwarded-for"].split(',')[0].trim() || req.connection.remoteAddress;
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
        ip: ipAddress,
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
  const password = 'hey';
  const salt = 'salt';
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
  const algorithm = 'aes-256-cbc';
  const iv = Buffer.alloc(16, 0); // fixed IV

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(confessionId.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

app.get('/rate-limit', async (req, res) => {
  const ipAddress = req.ip;
  try {
    let doc = await RateLimit.findOne({ ip: ipAddress, count });
    if (!doc) {
      doc = new RateLimit({ ip: ipAddress, count: 0, timestamp: Date.now() });
      await doc.save();
    } else {
      const currentTime = Date.now();
      const timeDifference = currentTime - doc.timestamp;

      if (timeDifference >= 3600000) { // 1 hour in milliseconds
        // Check if the IP address has exceeded the rate limit in the past hour
        const pastHourDocs = await RateLimit.find({ ip: ipAddress, timestamp: { $gte: currentTime - 3600000 } });
        if (pastHourDocs.length >= 5) {
          return res.status(401).send('<span>Limit reached</span>');
        } else {
          doc.count = 0;
          doc.timestamp = currentTime;
        }
      }

      if (doc.count >= 5) {
        return res.status(401).send('<span>Limit reached</span>');
      }

      doc.count++;
      doc.timestamp = currentTime;
      await doc.save();
    }
    res.send(`<span>Count: ${doc.count}</span>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('<span>Error: Internal Server Error</span>');
  }
});

app.post("/deleteconf", async (req, res) => {
  try {
    const encryptedConfessionId = req.body.objectId; // Get the encrypted confession ID from the request body

    // Decrypt the confession ID
    const confessionId = decryptConfessionCode(encryptedConfessionId);

    // Log the confessionId value
    console.log("Confession ID:", confessionId);

    // Start a database transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the confession in the Confession collection
      const confession = await Confession.findById(confessionId);

      if (!confession) {
        console.error("Confession not found");
        res.redirect("/static/err400");
        return;
      }

      if (confession.redeemed) {
        const redeemerId = confession.redeemerId;
        const coin = await Coin.findOne({ userId: redeemerId });

        if (coin) {
          coin.coins -= 50;
          await coin.save();
        }
      } else {
        // Find the user's coin balance
        const userCoin = await Coin.findOne({ userId: confession.redeemerId });

        if (userCoin) {
          userCoin.coins -= 50;
          await userCoin.save();
        }
      }

      // Delete the confession
      await Confession.findByIdAndDelete(confessionId);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.redirect("/static/deleted");
    } catch (error) {
      // Abort the transaction if an error occurs
      await session.abortTransaction();
      session.endSession();

      console.error(error);
      res.redirect("/static/err400");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/static/err400");
  }
});

app.post("/delete/:id", async (req, res) => {
  try {
    const confessionId = req.params.id;

    // Find the confession in the Confession collection
    Confession.findById(confessionId)
    .then((confession) => {
      if (confession.redeemed) {
        const redeemerId = confession.redeemerId;
        Coin.findOne({ userId: redeemerId })
        .then((coin) => {
          if (coin) {
            coin.coins -= 50;
            coin.save()
            .then(() => {
              Confession.findByIdAndDelete(confessionId)
              .then(() => {
                res.redirect("/bin/cementglazeddoughnuts/adminpanel");
              })
              .catch((err) => {
                console.error(err);
                res.status(500).json({ message: "Server Error" });
              });
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({ message: "Server Error" });
            });
          } else {
            Confession.findByIdAndDelete(confessionId)
            .then(() => {
              res.redirect("/bin/cementglazeddoughnuts/adminpanel");
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({ message: "Server Error" });
            });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Server Error" });
        });
      } else {
        Confession.findByIdAndDelete(confessionId)
        .then(() => {
          res.redirect("/bin/cementglazeddoughnuts/adminpanel");
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Server Error" });
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

function decryptConfessionCode(encrypted) {
  const password = 'hey';
  const salt = 'salt';
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
  const algorithm = 'aes-256-cbc';
  const iv = Buffer.alloc(16, 0); // fixed IV

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
module.exports = app;
