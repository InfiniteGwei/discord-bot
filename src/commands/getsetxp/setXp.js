const {
    ApplicationCommandOptionType,
  } = require('discord.js');
  
  module.exports = {
    deleted: false,
    name: 'set-xp',
    description: 'Set XP of a user.',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
      {
        name: 'user',
        description: 'Whose XP do you want to set?',
        required: true,
        type: ApplicationCommandOptionType.Mentionable,
      },
      {
        name: 'xp',
        description: 'What is the XP you want to set?',
        required: true,
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: 'password',
        description: 'Enter the password to run this command!',
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  
    callback: (client, interaction) => {
        const { options } = interaction;
    
        const userOption = options.get('user');
        const xpOption = options.get('XP');
        const passwordOption = options.get('password');
    
        const user = userOption?.member;
        const xp = xpOption?.value;
        const password = passwordOption?.value;
    
        // Check if the provided password is correct
        if (password !== process.env.SETXP_PASSWORD) {
          return interaction.reply('Incorrect password! This command is restricted.');
        }
        interaction.reply("add the set xp logic here!");
      },
    };