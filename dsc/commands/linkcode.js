const { EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
const Link = require('../../models/link');

module.exports = {
  name: 'generatecode',
  description: 'Generate a unique link code',
  options: [],
  execute: async (interaction) => {
    const link = await Link.findOne({ userId: interaction.user.id });
    if (!link) {
      const code = crypto.randomBytes(3).toString('hex');
      const newLink = new Link({
        userId: interaction.user.id,
        linkCode: code,
        avatar: interaction.user.avatarURL(),
        username: interaction.user.username
      });
      await newLink.save();
      const embed = new EmbedBuilder()
        .setTitle('Link Code')
        .setDescription(`Your unique link code is: \`\`\`${code}\`\`\``)
        .setColor('#00FF00');
        interaction.reply({ embeds: [embed], ephemeral: true });
    } else if (!link.linkCode) {
      const code = crypto.randomBytes(3).toString('hex');
      link.linkCode = code;
      link.avatar = interaction.user.avatarURL();
      link.username = interaction.user.username;
      await link.save();
      const embed = new EmbedBuilder()
        .setTitle('Link Code')
        .setDescription(`Your unique link code is: \`\`\`${code}\`\`\``)
        .setColor('#00FF00');
        interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        const embed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription(`You have already generated a link code: \`\`\`${link.linkCode}\`\`\`. Please use this code to link your account.`)
          .setColor('#FF0000');
          interaction.reply({ embeds: [embed], ephemeral: true });
      }
  }
};