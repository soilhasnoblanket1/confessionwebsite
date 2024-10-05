const Coin = require('../../models/coin');
const Confession = require('../../models/confession');
const crypto = require("crypto");
const mongoose = require('mongoose');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'confess',
  description: 'Confess something',
  options: [
    {
      name: 'confession',
      description: 'What do you want to confess?',
      type: 3,
      required: true
    }
  ],
  execute: async (interaction) => {
    try {
      const confession = interaction.options.getString('confession');
      const userId = interaction.user.id;
      const ownerId = '1014838328216014869'; 

      if (confession.length > 200) {
        const embed = new EmbedBuilder()
          .setTitle('Confession Too Long!')
          .setDescription(`Your confession is too long! Please keep it under 200 characters.`)
          .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
          .setColor(0x0099FF)
          .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
        await interaction.reply({ embeds: [embed]});
        return;
      }

      if (userId === ownerId) {
        const newConfession = new Confession({ 
          confession: confession,
          ip: interaction.user.username
        });
        await newConfession.save();
        const encryptedConfessionId = encryptConfessionCode(newConfession._id.toString());
        const embed = new EmbedBuilder()
          .setTitle('Confession Saved!')
          .setDescription(`Your confession has been saved successfully! 🙏`)
          .addFields(
            { name: 'Confession Code', value: `Your confession code is: ***${encryptedConfessionId}***`, inline: true },
            { name: 'Sent By', value: `@${interaction.user.username}`, inline: true }
          )
          .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
          .setColor(0x0099FF)
          .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        await deleteDuplicateConfessions(confession, newConfession._id);
      } else {
        const confessionLimit = await ConfessionLimit.findOne({ userId });
        if (!confessionLimit) {
          const newConfession = new Confession({ 
            confession: confession,
            ip: interaction.user.username
          });
          await newConfession.save();
          const newConfessionLimit = new ConfessionLimit({ 
            userId, 
            confessionCount: 1, 
            lastConfessionTime: new Date() 
          });
          await newConfessionLimit.save();
          const encryptedConfessionId = encryptConfessionCode(newConfession._id.toString());
          const embed = new EmbedBuilder()
            .setTitle('Confession Saved!')
            .setDescription(`Your confession has been saved successfully! 🙏`)
            .addFields(
              { name: 'Confession Code', value: `Your confession code is: ***${encryptedConfessionId}***`, inline: true },
              { name: 'Sent By', value: `@${interaction.user.username}`, inline: true }
            )
            .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
            .setColor(0x0099FF)
            .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
          await interaction.reply({ embeds: [embed], ephemeral: true });
          await deleteDuplicateConfessions(confession, newConfession._id);
        } else {
          const currentTime = new Date();
          const lastConfessionTime = confessionLimit.lastConfessionTime;
          const timeDiff = (currentTime - lastConfessionTime) / 1000 / 60 / 60; // Convert to hours
          if (timeDiff < 1) {
            if (confessionLimit.confessionCount >= 3) {
              const embed = new EmbedBuilder()
                .setTitle('Confession Limit Reached!')
                .setDescription(`You have reached the confession limit for this hour! ⏰`)
                .addFields(
                  { name: 'Try Again', value: `You can try again in ${60 - timeDiff} minutes.`, inline: true }
                )
                .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
                .setColor(0x0099FF)
                .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
              await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
              const newConfession = new Confession({ 
                confession: confession,
                ip: interaction.user.username
              });
              await newConfession.save();
              confessionLimit.confessionCount++;
              confessionLimit.lastConfessionTime = currentTime;
              await confessionLimit.save();
              const encryptedConfessionId = encryptConfessionCode(newConfession._id.toString());
              const embed = new EmbedBuilder()
                .setTitle('Confession Saved!')
                .setDescription(`Your confession has been saved successfully! 🙏 `)
                .addFields(
                  { name: 'Confession Code', value: `Your confession code is: ***${encryptedConfessionId}***`, inline: true },
                  { name: 'Sent By ', value: `@${interaction.user.username}`, inline: true }
                )
                .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
                .setColor(0x0099FF)
                .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
              await interaction.reply({ embeds: [embed], ephemeral: true });
              await deleteDuplicateConfessions(confession, newConfession._id);
            }
          } else {
            const newConfession = new Confession({ 
              confession: confession,
              ip: interaction.user.username
            });
            await newConfession.save();
            confessionLimit.confessionCount = 1;
            confessionLimit.lastConfessionTime = currentTime;
            await confessionLimit.save();
            const encryptedConfessionId = encryptConfessionCode(newConfession._id.toString());
            const embed = new EmbedBuilder()
              .setTitle('Confession Saved!')
              .setDescription(`Your confession has been saved successfully! 🙏`)
              .addFields(
                { name: 'Confession Code', value: `Your confession code is: ***${encryptedConfessionId}***`, inline: true },
                { name: 'Sent By', value: `@${interaction.user.username}`, inline: true }
              )
              .setThumbnail('https://celestial-trinity.onrender.com/assets/1.png')
              .setColor(0x0099FF)
              .setFooter({ text: 'Confession Bot', iconURL: 'https://celestial-trinity.onrender.com/assets/1.png' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            await deleteDuplicateConfessions(confession, newConfession._id);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

async function deleteDuplicateConfessions(confession, keepId) {
  const duplicateConfessions = await Confession.find({ confession: confession, _id: { $ne: keepId } });
  if (duplicateConfessions.length > 0) {
    await Confession.deleteMany({ confession: confession, _id: { $ne: keepId } });
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
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}