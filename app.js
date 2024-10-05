// Import dependencies
const { Router } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const ejs = require("ejs");
const routermain = require("./events/route.js");
const routerapi = require("./events/api.js");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "css")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/", routermain);
app.use("/api", routerapi);
app.get("*", (req, res) => {
  res.redirect("/");
});

app.use(bodyParser.urlencoded({ extended: true }));

const Discord = require('discord.js');
const crypto = require('crypto');
const Confession = require('./models/confession');
const Coin = require('./models/coin');

mongoose.connect('mongodb+srv://soilbhai:saurav@soil.zvhk0qg.mongodb.net/?retryWrites=true&w=majority&appName=soil', { useNewUrlParser: true, useUnifiedTopology: true });

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent
  ]
});

const confessionLimitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  confessionCount: { type: Number, default: 0 },
  lastConfessionTime: { type: Date, default: Date.now }
});

const ConfessionLimit = mongoose.model('ConfessionLimit', confessionLimitSchema);

client.commands = new Discord.Collection();

const fs = require('fs');

const commandsPath = path.join(__dirname, 'dsc', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (command.name && command.description && command.options && command.execute) {
    client.commands.set(command.name, command);
  } else {
    console.error(`Invalid command file: ${file}`);
  }
}

client.on('ready', async () => {
  console.log('Client is ready!');

  // Create slash commands for all guilds
  const commands = [];
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.name && command.description && command.options && command.execute) {
      client.commands.set(command.name, command);
      console.log(`Loaded command: ${file}`);

      // Add the command to the array
      commands.push({
        name: command.name,
        description: command.description,
        options: command.options
      });
    } else {
      console.error(`Invalid command file: ${file}`);
    }
  }

  // Register the slash commands for all guilds
  client.guilds.cache.forEach(guild => {
    guild.commands.fetch().then(commandsList => {
      const existingCommands = commandsList.map(command => command);
      const newCommands = commands.filter(command => !existingCommands.find(c => c.name === command.name));

      // Create new commands
      newCommands.forEach(command => {
        guild.commands.create(command).then(() => {
          console.log(`Created new command: ${command.name}`);
        }).catch(error => {
          console.error(`Error creating new command: ${command.name} - ${error}`);
        });
      });
    }).catch(error => {
      console.error(`Error fetching commands for guild ${guild.name}: ${error}`);
    });
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.followUp('An error occurred while executing the command!');
  }
});

client.login(process.env.BOTTOKEN);

app.listen(3000, () => {
  console.log(`Server is running on port 3000!`);
});