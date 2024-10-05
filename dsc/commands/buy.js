const { EmbedBuilder } = require('discord.js');
const Coin = require('../../models/coin');

module.exports = {
  name: 'buy',
  description: 'Buy an item from the store',
  options: [
    {
      name: 'item',
      description: 'The item to buy',
      type: 3,
      required: true,
      autocomplete: true
    }
  ],
  execute: async (interaction) => {
    const item = interaction.options.getString('item');
    if (item === 'Leather Hat') {
      const nepalTime = new Date();
      const nepalHour = nepalTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit' });

      const hour = parseInt(nepalHour.split(':')[0]);

      if (hour >= 18 && hour < 19 || hour >= 6 && hour < 7) {
        const coin = await Coin.findOne({ userId: interaction.user.id });
        if (!coin) {
          const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('You do not have enough coins to buy this item.')
            .addFields(
              { name: 'Error Message', value: '```You need 1500 coins to buy this item.```', inline: true }
            )
            .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
            .setColor('#FF0000')
            .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
          interaction.reply({ embeds: [embed] });
          return;
        }

        if(coin.hasLeatherHat = true) {
          const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Kina kinnu paryo dui choti?')
            .addFields(
              { name: 'Error Message', value: '```You have already bought the item.```', inline: true }
            )
            .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
            .setColor('#FF0000')
            .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
          interaction.reply({ embeds: [embed] });
          return;
        }

        if (coin.coins < 1500) {
          const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('You do not have enough coins to buy this item.')
            .addFields(
              { name: 'Error Message', value: '```You need 1500 coins to buy this item.```', inline: true }
            )
            .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
            .setColor('#FF0000')
            .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
          interaction.reply({ embeds: [embed] });
          return;
        }

        coin.coins -= 1500;
        coin.hasLeatherHat = true;
        await coin.save();

        const embed = new EmbedBuilder()
          .setTitle('Item Purchased')
          .setDescription('You have purchased the Leather Hat!')
          .addFields(
            { name: 'New Balance', value: '```' + coin.coins.toString() + ' coins```', inline: true }
          )
          .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
          .setColor('#00FF00')
          .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
        interaction.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription('You can only buy the Leather Hat between 6:00 PM and 7:00 PM or 6:00 AM and 7:00 AM Nepal Time.')
          .addFields(
            { name: 'Error Message', value: '```Please try again during the allowed time.```', inline: true }
          )
          .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
          .setColor('#FF0000')
          .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
        interaction.reply({ embeds: [embed] });
        return;
      }
    }
  },
  autocomplete: async (interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    const choices = ['Leather Hat'];
    const filteredChoices = choices.filter(choice => choice.startsWith(focusedOption.value));
    await interaction.respond(
      filteredChoices.map(choice => ({ name: choice, value: choice }))
    );
  }
};