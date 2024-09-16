const Discord = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, entersState } = require('@discordjs/voice');
const fs = require('fs');

const discordConfig = {
  token: process.env.token,
  clientId: '1285231651332558909',
  guildId: '1141793551856967716',
  channelId: '1141793551856967716'
};

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildVoiceStates
  ]
});

client.login(discordConfig.token);

let connection = null;
let player = null;
let connectionDestroyed = false;
let startTime = Date.now();

client.on('ready', () => {
  console.log('Bot is online!');
  joinVoiceChannelAndPlayAudio();
});

client.on('messageCreate', (message) => {
  if (message.content.toLowerCase().includes('saurav')) {
    message.reply('I am gay');
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.channelId === null) {
    joinVoiceChannelAndPlayAudio();
  }
});

function joinVoiceChannelAndPlayAudio() {
  const voiceChannel = client.channels.cache.get(discordConfig.channelId);
  connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  connectionDestroyed = false;
  startTime = Date.now();

  player = createAudioPlayer();

  player.on('error', error => {
    console.error(error);
    if (!connectionDestroyed) {
      connection.destroy();
      connectionDestroyed = true;
    }
  });

  player.on('stateChange', (oldState, newState) => {
    if (newState.status === 'idle' && !connectionDestroyed) {
      const currentTime = Date.now();
      if (currentTime - startTime < 3600000) { // 1 hour in milliseconds
        const resource = createAudioResource(fs.createReadStream('./saurav.mp3'));
        player.play(resource);
      } else {
        connection.destroy();
        connectionDestroyed = true;
      }
    }
  });

  const resource = createAudioResource(fs.createReadStream('./saurav.mp3'));
  player.play(resource);
  connection.subscribe(player);
}
