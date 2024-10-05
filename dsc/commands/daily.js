const { EmbedBuilder } = require('discord.js');
const Coin = require('../../models/coin');
const mongoose = require('mongoose');

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward',
    options: [],
    execute: async (interaction) => {
        const userId = interaction.user.id;
        const coin = await Coin.findOne({ userId });
        if (!coin) {
          const newCoin = new Coin({ userId, coins: 250, lastDaily: new Date() });
          await newCoin.save();
          const embed = new EmbedBuilder()
            .setTitle('Daily Reward')
            .setDescription('You have claimed your daily reward of 250 coins!')
            .addFields(
              { name: 'New Balance', value: '```250 coins```', inline: true }
            )
            .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
            .setColor('#00FF00') // Green color
            .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
          interaction.reply({ embeds: [embed] });
        } else {
          if (!coin.lastDaily) {
            coin.lastDaily = new Date();
            await coin.save();
          }
          const lastDaily = coin.lastDaily;
          const now = new Date();
          const diff = now.getTime() - lastDaily.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          if (hours >= 24) {
            coin.coins += 250;
            coin.lastDaily = now;
            await coin.save();
            const embed = new EmbedBuilder()
              .setTitle('Daily Reward')
              .setDescription('You have claimed your daily reward of 250 coins!')
              .addFields(
                { name: 'New Balance', value: '```' + coin.coins.toString() + ' coins```', inline: true }
              )
              .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
              .setColor('#00FF00') // Green color
              .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
            interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedBuilder()
              .setTitle('Daily Reward')
              .setDescription('You have already claimed your daily reward today!')
              .addFields(
                { name: 'Next Reward', value: '```' + (24 - hours) + ' hours```', inline: true }
              )
              .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
              .setColor('#FF0000') // Red color
              .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
            interaction.reply({ embeds: [embed] });
          }
        }
      }
}