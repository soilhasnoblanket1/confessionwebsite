const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const Confession = require("../models/confession.js");
const path = require("path");
const Comment = require("../models/comment.model");
const Discord = require('discord.js');

const discordConfig = {
  token: process.env.BOTTOKEN,
  clientId: '882161977009512448',
  guildId: '1141793551403978803',
  channelId: '1285234436560130151'
};

const client = new Discord.Client({
    intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.GuildMembers,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.MessageContent
    ]
  });

client.login(discordConfig.token);

const multer = require('multer');

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

app.get("/", (req, res) => {
  Confession.find().then((confessions) => {
    res.render("index", {
      confessions: confessions,
      formatTimeDifference,
    });
  });
});


app.get("/sabal", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "html", "html", "sabal.html"));
});

app.get("/static/vpnblock", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "error", "vpnblock.html"));
});

app.get("/fortune", (req, res) => {
  res.render("fortune");
});

app.get("/static/imgfetch", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "error", "imgfetch.html"));
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
    "mongodb+srv://soilbhai:saurav@soil.zvhk0qg.mongodb.net/?retryWrites=true&w=majority&appName=soil",
    { useNewUrlParser: true, useUnifiedTopology: true },
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/deleteconfession", (req, res) => {
  Confession.find().then((confessions) => {
    res.render("delete", { confessions: confessions });
  });
});

app.get('/api/confessions', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // number of confessions per page

  try {
    const totalConfessions = await Confession.countDocuments();
    const confessions = await Confession.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'confession',
          as: 'comments'
        }
      }
    ]).skip((page - 1) * limit).limit(limit);

    res.json({ confessions, totalConfessions, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/feed', async (req, res) => {
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

  try {
    const confessions = await Confession.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'confession',
          as: 'comments'
        }
      }
    ]);

    res.render('feed', { confessions, formatTimeDifference });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/confession/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send('Invalid confession ID');
    }

    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).send('Confession not found');
    }

    console.log('Confession:', confession);

    const comments = await Comment.find({ confession: new mongoose.Types.ObjectId(id) }).catch((err) => {
      console.error('Error fetching comments:', err);
      res.status(500).send('Error fetching comments');
    });

    res.render('confession', { confession, comments, formatTimeDifference });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/post/:id", async (req, res) => {
  try {
    const confessionId = new mongoose.Types.ObjectId(req.params.id);
    const confession = await Confession.findById(confessionId);
    if (!confession) {
      return res.status(404).json({ error: "Confession not found" });
    }

    if (!req.body.text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const comment = new Comment({
      text: req.body.text,
      confession: confessionId,
    });
    await comment.save();
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create comment" });
  }
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
const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only JPG, JPEG, PNG, and GIF files are allowed'));
    }
    cb(null, true);
  }
});
const { Attachment } = require('discord.js');
const sharp = require('sharp');

app.post('/postimg/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }
    const file = req.file;
    if (!file.path || !file.originalname) {
      throw new Error('Invalid file uploaded');
    }
    const caption = req.body.caption; // Get the caption from the request body
    try {
      const buffer = await sharp(file.path).toBuffer();
      const messagePayload = {
        embeds: [
          {
            title: 'Image uploaded successfully!',
            description: caption, // Use the caption here
            image: {
              url: 'attachment://' + file.originalname
            }
          }
        ],
        files: [{ attachment: buffer, name: file.originalname }]
      };
      const message = await client.channels.cache.get(discordConfig.channelId).send(messagePayload);
      res.redirect('/static/imgfetch');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error processing image');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading image');
  }
});

app.get('/panel/sauravchor/post', (req, res) => {
  const images = [];
  client.channels.cache.get(discordConfig.channelId).messages.fetch().then(messages => {
    messages.forEach(message => {
      // Fetch images from attachments and embeds
      if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
          images.push(attachment.url);
        });
      }
      if (message.embeds.length > 0) {
        message.embeds.forEach(embed => {
          if (embed.image) {
            images.push(embed.image.url);
          }
        });
      }
    });

    res.render('adminpost', { images });
  });
});

app.get('/images', (req, res) => {
  const images = [];
  client.channels.cache.get(discordConfig.channelId).messages.fetch().then(messages => {
    messages.forEach(message => {
      // Fetch images from attachments and embeds
      if (message.attachments.size > 0) {
        message.attachments.forEach(attachment => {
          const embed = message.embeds.find(embed => embed.image && embed.image.url === attachment.url);
          const caption = embed ? embed.description : message.content;
          images.push({ url: attachment.url, caption, orientation: 'landscape', message });
        });
      }
      if (message.embeds.length > 0) {
        message.embeds.forEach(embed => {
          if (embed.image) {
            const caption = embed.description ? embed.description : message.content;
            images.push({ url: embed.image.url, caption, orientation: 'landscape', message });
          }
        });
      }
    });

    const reactedImages = images.filter(image => {
      const reaction = image.message.reactions.resolve('✅');
      return reaction && reaction.count > 0;
    });

    res.render('images', { images: reactedImages });
  });
});

app.post('/admin/react', express.urlencoded({ extended: true }), (req, res) => {
  const { image, reaction } = req.body;
  console.log(reaction);
  client.channels.cache.get(discordConfig.channelId).messages.fetch().then(messages => {
    messages.forEach(message => {
      if (message.attachments.some(attachment => attachment.url === image) ||
          message.embeds.some(embed => embed.image && embed.image.url === image) ||
          message.content.includes(image)) {
        // Remove the "tick" emoji reaction if the reaction is "cross"
        if (reaction === '❌') {
          message.reactions.resolve('✅').remove();
        } else {
          // React with the specified reaction
          message.react(reaction);
          message.react('❌');
        }
      }
    });
  });
});
module.exports = app;
