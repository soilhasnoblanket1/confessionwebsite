const { EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
const Link = require('../../models/link');

module.exports = {
  name: 'resetcode',
  description: 'Reset your link code',
  options: [],
  execute: async (interaction) => {
    const link = await Link.findOne({ userId: interaction.user.id });
    if (!link) {
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('You have not generated a link code yet.')
        .setColor('#FF0000');
      interaction.reply({ embeds: [embed] });
    } else {
      const code = crypto.randomBytes(3).toString('hex');
      await Link.updateOne({ userId: interaction.user.id }, {
        linkCode: code,
        avatar: interaction.user.avatarURL(),
        username: interaction.user.username
      });
      const embed = new EmbedBuilder()
        .setTitle('Link Code Reset')
        .setDescription(`Your new link code is: ${code}`)
        .setColor('#00FF00');
      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};