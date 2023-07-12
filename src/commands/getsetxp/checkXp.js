const {
    ApplicationCommandOptionType,
  } = require('discord.js');
  
  module.exports = {
    deleted: false,
    name: 'check-xp',
    description: 'Check XP of a user.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
      {
        name: 'user',
        description: 'Whose XP do you want to check?',
        required: true,
        type: ApplicationCommandOptionType.Mentionable,
      },
    ],
  
    callback: (client, interaction) => {
      //add code to check XP here!
      interaction.reply("Add code to check XP here!");
    },
  }; 
  