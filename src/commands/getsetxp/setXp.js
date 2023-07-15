const Level = require('../../models/Level');

const {
    ApplicationCommandOptionType,
  } = require('discord.js');
  
  module.exports = {
    deleted: false,
    name: 'set-xp',
    description: 'Set XP of a user.',
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
  
    callback: async (client, interaction) => {

        const { options } = interaction;
        // Sends the user object, that's why we have to append `user.id`
        // instead of just `.id`
        const userId = options.get('user').user.id;
        const username = options.get('user').user.username;
        const xpToSet = options.get('xp').value;
        const passwordEntered = options.get('password').value;

        // Get the guild ID from the interaction
        const guildId = interaction.guild.id;

        // Use these IDs to build a query
        const query = {
          userId: userId,
          guildId: guildId
        };

        if (passwordEntered !== process.env.SETXP_PASSWORD) {
          return interaction.reply({
            content: 'Incorrect password! This command is restricted.',
            ephemeral: true,
          });

        } else if (xpToSet<0) {
          return interaction.reply({
            content: 'Please enter a non-negative value.',
            ephemeral: true,
          });
          
        } else {
            try {
              // Fetch user's level from the database
              const level = await Level.findOne(query);
              level.xp = xpToSet;
              interaction.reply({
                  content: `You set ${username}'s XP to ${level.xp} points.`,
                  ephemeral: true,
              });
              
            } catch (error) {
              console.error(`Error fetching XP for user ${userId}: ${error}`);
              interaction.reply({
                  content: `Sorry, I couldn't set the XP for ${username}.`,
                  ephemeral: true,
              });
            }
        }
      },
    };