const GuildPreferences = require('../../models/GuildPreferences');
const { ApplicationCommandOptionType } = require('discord.js');
let lastUsed = 0;

module.exports = {
    deleted: false,
    name: 'config-levels',
    description: 'Define the XP system of this server. Ideally, this should be done just once.',
    options: [
        {
            name: 'levels',
            description: 'Number of levels for the guild.',
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
        const levelsToSet = options.get('levels').value;
        const passwordEntered = options.get('password').value;
        const guildId = interaction.guild.id;

        if (passwordEntered !== process.env.SETXP_PASSWORD) {
            return interaction.reply({
                content: 'Incorrect password! This command is restricted.',
                ephemeral: true,
            });
        } else if (levelsToSet < 2 || levelsToSet > 5) {
            return interaction.reply({
                content: 'Please enter a value between 2 and 5.',
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
                        levels: levelsToSet,
                        levelingSchema: [],
                    });
                } else {
                    // Update levels
                    guildPreferences.levels = levelsToSet;
                }

                // Now request more information from the admin about each level
                for (let i = 0; i < levelsToSet; i++) {
                    await interaction.reply(`Please enter the minimum XP and the role ID (separated by a space) for level ${i + 1} (e.g., "1000 123456789012345678"):`);
                    const collected = await interaction.channel.awaitMessages({ max: 1, time: 60000, errors: ['time'] });

                    const [xp, roleId] = collected.first().content.split(' ');
                    guildPreferences.levelingSchema[i] = { level: i + 1, minXP: parseInt(xp, 10), roleId: roleId };
                }

                // Save
                try {
                    await guildPreferences.save();
                } catch (e) {
                    console.log(`Error running set-levels command: ${e}`);
                    return interaction.reply({
                        content: 'Error saving level settings. Please run the command again.',
                        ephemeral: true,
                    });
                }

                console.log(`Level settings for guild ${guildId} were set by an admin.`);
                return interaction.reply({
                    content: 'You set the level settings for this guild.',
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`Error setting level settings for guild ${guildId}: ${error}`);
                return interaction.reply({
                    content: 'Sorry, I couldn\'t set the level settings for this guild. Please try again.',
                    ephemeral: true,
                });
            }
        }
    },
};
