const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'store',
    description: 'View the store',
    options: [],
    execute: async (interaction) => {
      const embed = new EmbedBuilder()
        .setTitle('Store')
        .setDescription('Welcome to the store!')
        .addFields(
          { name: 'Leather Hat', value: '```1500 coins```', inline: true }
        )
        .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
        .setColor('#00FF00')
        .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
  
      interaction.reply({ embeds: [embed] });
    }
  };