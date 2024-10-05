const { EmbedBuilder } = require('discord.js');
const Coin = require('../../models/coin');

module.exports = {
    name: 'balance',
    description: 'Check your balance',
    options: [],
    execute: async (interaction) => {
        const coin = await Coin.findOne({ userId: interaction.user.id });
    if (!coin) {
      const embed = new EmbedBuilder()
        .setTitle('Balance')
        .setDescription('Your current balance is:')
        .addFields(
            { name: 'Coins', value: `${coin.coins.toString()}🪙`, inline: true },
        )
        .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
        .setColor('RED')
        .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
      interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('Balance')
        .setDescription('Your current balance is:')
        .addFields(
            { name: 'Coins', value: `\`\`\`${coin.coins.toString()}🪙\`\`\``, inline: true },
        )
        .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
        .setColor(0x0099FF)
        .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
      interaction.reply({ embeds: [embed] });
    }
    }
}