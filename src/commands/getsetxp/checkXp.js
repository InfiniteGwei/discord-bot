const Level = require('../../models/Level');

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

    //get variables to call db
    //check the xp!
  
    callback: (client, interaction) => {
      //add code to check XP here!
      interaction.reply({
        content: "Add code to check XP here!",
        ephemeral: true,
    });
   }
  }; 