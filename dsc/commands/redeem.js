const { EmbedBuilder } = require('discord.js');
const Coin = require('../../models/coin');
const Confession = require('../../models/confession');
const crypto = require("crypto");
const mongoose = require('mongoose');

module.exports = {
    name: 'redeem',
    description: 'Redeem your coins',
    options: [
        {
          name: 'code',
          description: 'Redeem your coins',
          type: 3,
          required: true
        }
      ],
    execute: async (interaction) => {
        const encryptedConfessionId = interaction.options.getString('code');
if (encryptedConfessionId === null) {
    const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Invalid input type. Expected a string.')
        .addFields(
            { name: 'Error Message', value: '```Please try again with a valid confession code.```', inline: true }
        )
        .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
        .setColor('#FF0000')
        .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
    interaction.reply({ embeds: [embed] });
    return;
}
        try {
            const confessionId = decryptConfessionCode(encryptedConfessionId);
            const mongooseId = new mongoose.Types.ObjectId(confessionId);
            const confession = await Confession.findOne({ _id: mongooseId });
            if (!confession) {
                const embed = new EmbedBuilder()
                    .setTitle('Invalid Confession Code')
                    .setDescription('The confession code you provided is invalid.')
                    .addFields(
                        { name: 'Error', value: 'Please try again with a valid confession code.', inline: true }
                    )
                    .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
                    .setColor('#FF0000')
                    .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
                interaction.reply({ embeds: [embed] });
                return;
            }

            if (confession.redeemed) {
                const embed = new EmbedBuilder()
                    .setTitle('Confession Code Already Redeemed')
                    .setDescription('The confession code you provided has already been redeemed.')
                    .addFields(
                        { name: 'Error', value: 'Please try again with a different confession code.', inline: true }
                    )
                    .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
                    .setColor('#FF0000')
                    .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
                interaction.reply({ embeds: [embed] });
                return;
            }

            await Confession.updateOne({ _id: mongooseId }, { $set: { redeemed: true, redeemerId: interaction.user.id } });

            let coin = await Coin.findOne({ userId: interaction.user.id });
            if (!coin) {
                coin = new Coin({
                    userId: interaction.user.id,
                    username: interaction.user.username,
                    avatar: interaction.user.displayAvatarURL(),
                    coins: 50
                });
            } else {
                coin.coins += 50;
                coin.username = interaction.user.username;
                coin.avatar = interaction.user.displayAvatarURL();
            }
            await coin.save();

            const embed = new EmbedBuilder()
                .setTitle('Confession Code Redeemed Successfully')
                .setDescription('You have successfully redeemed the confession code.')
                .addFields(
                    { name: 'Reward', value: '```50 coins```', inline: true },
                    { name: 'New Balance', value: '```' + coin.coins.toString() + ' coins```', inline: true }
                )
                .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
                .setColor('#00FF00')
                .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
            interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('Error')
                .setDescription('An error occurred while redeeming the confession code.')
                .addFields(
                    { name: 'Error Message', value: '```' + error.toString() + '```', inline: true }
                )
                .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
                .setColor('#FF0000')
                .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png ' });
            interaction.reply({ embeds: [embed] });
        }
    }
}

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

function decryptConfessionCode(encrypted) {
    const password = 'hey';
    const salt = 'salt';
    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
    const algorithm = 'aes-256-cbc';
    const iv = Buffer.alloc(16, 0); // fixed IV

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'), 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}