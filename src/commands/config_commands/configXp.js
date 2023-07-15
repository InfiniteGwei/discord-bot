const Level = require('../../models/Level');
const GuildPreferences = require('../../models/GuildPreferences');
let lastUsed = 0;

const {
    ApplicationCommandOptionType,
} = require('discord.js');

module.exports = {
    deleted: false,
    name: 'config-base-xp',
    description: 'Set the base XP increment of this server. Ideally, this should be done just once.',
    options: [
        {
            name: 'base_xp',
            description: 'What is the base XP of your server?',
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

        // Check if the user has administrator permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
            content: 'You must have administrator permissions to use this command.',
            ephemeral: true,
        });
        }

        // cooldown
        const now = Date.now();
        if (now - lastUsed < 3000) {
            return interaction.reply({
                content: 'This command can only be used once every 3 seconds.',
                ephemeral: true,
            });
        }
        lastUsed = now;

        const { options } = interaction;

        const baseXpToSet = options.get('base_xp').value;
        const passwordEntered = options.get('password').value;

        // Get the guild ID from the interaction
        const guildId = interaction.guild.id;

        if (passwordEntered !== process.env.SETXP_PASSWORD) {
            return interaction.reply({
                content: 'Incorrect password! This command is restricted.',
                ephemeral: true,
            });

        } else if (baseXpToSet < 0) {
            return interaction.reply({
                content: 'Please enter a non-negative value.',
                ephemeral: true,
            });

        } else {
            try {
                // Fetch guild preferences from the database
                let guildPreferences = await GuildPreferences.findOne({ guildId: guildId });
                
                if (!guildPreferences) {
                    // Guild preferences don't exist, create new
                    guildPreferences = new GuildPreferences({
                        guildId: guildId,
                        baseXp: baseXpToSet,
                    });
                } else {
                    // Update base XP
                    guildPreferences.baseXp = baseXpToSet;
                }
                
                // Save
                try {
                    await guildPreferences.save();
                } catch (e) {
                    console.log(`Error running set-base-xp command: ${e}`);
                    return interaction.reply({
                        content: 'Error saving base XP increment. Please run the command again.',
                        ephemeral: true,
                    });
                }
                
                console.log(`Base XP increment for guild ${guildId} was set to ${guildPreferences.baseXp} by an admin.`);
                
                return interaction.reply({
                    content: `You set the base XP increment for this guild to ${guildPreferences.baseXp}.`,
                    ephemeral: true,
                });

            } catch (error) {
                console.error(`Error setting base XP increment for guild ${guildId}: ${error}`);
                interaction.reply({
                    content: `Sorry, I couldn't set the base XP increment for this guild. Please try again.`,
                    ephemeral: true,
                });
            }
        }
    },
};
