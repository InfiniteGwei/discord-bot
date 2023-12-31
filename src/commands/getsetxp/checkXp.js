const Level = require('../../models/Level');

const {
    ApplicationCommandOptionType,
} = require('discord.js');

module.exports = {
  deleted: false,
  name: 'check-xp',
  description: 'Check XP of a user.',
  options: [
      {
          name: 'user',
          description: 'Whose XP do you want to check?',
          required: true,
          type: ApplicationCommandOptionType.Mentionable,
      },
  ],

  callback: async (client, interaction) => {

      const { options } = interaction;
      // Sends the user object, that's why we have to append `user.id`
      // instead of just `.id`      
      const userId = options.get('user').user.id;
      const username = options.get('user').user.username;

      // Get the guild ID from the interaction
      const guildId = interaction.guild.id;
      
      // Use these IDs to build a query
      const query = {
          userId: userId,
          guildId: guildId
      };

      try {
          // Fetch the user's level from the database
          const level = await Level.findOne(query);

          if (level) {
              // If the user has a level in the database, reply with their XP
              interaction.reply({
                  content: `${username} has ${level.xp} XP points.`,
                  ephemeral: true,
              });
          } else {
              // If the user doesn't have a level in the database, reply with a default message
              interaction.reply({
                  content: `${username} has not earned any XP yet.`,
                  ephemeral: true,
              });
          }
      } catch (error) {
          console.error(`Error fetching XP for user ${userId}: ${error}`);
          interaction.reply({
              content: `Sorry, I couldn't fetch the XP for ${username}.`,
              ephemeral: true,
          });
      }
  }
};
