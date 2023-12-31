const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
let lastUsed = 0;

const {
    ApplicationCommandOptionType,
} = require('discord.js');

const ROLE_ARRAY = [
  { level: 1, roleId: '1115182213579935777' },
  { level: 2, roleId: '1115182916499144776' },
  { level: 3, roleId: '722112034224865281' },
  { level: 4, roleId: '1118517045210914959' },
  { level: 5, roleId: '1118517462498033705' }
];

// test roles
// const ROLE_ARRAY = [
//     { level: 1, roleId: '1132995762360418304' },
//     { level: 2, roleId: '1132996471172636682' },
//     { level: 3, roleId: '1132996508325781555' },
//     { level: 4, roleId: '1132996547932598353' },
//     { level: 5, roleId: '1132996642002452551' }
// ];

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

        } else if (xpToSet < 0) {
            return interaction.reply({
                content: 'Please enter a non-negative value.',
                ephemeral: true,
            });

        } else {
            try {
                // Fetch user's level from the database
                const level = await Level.findOne(query);

                if (level) {

                    // update XP
                    level.xp = xpToSet;
                    let oldLevel = level.level;
                    let newRole, oldRole;

                    // increase level 
                    while (level.xp > calculateLevelXp(level.level) && level.level <= 4) {
                        level.level += 1;
                    }
                    // decrease level
                    while (level.xp < calculateLevelXp(level.level - 1) && level.level > 1) {
                        level.level -= 1;
                    }

                    // Update roles
                    if (oldLevel !== level.level) {
                        const member = interaction.guild.members.cache.get(userId);
                        if (member) {
                            oldRole = ROLE_ARRAY.find(item => item.level === oldLevel);
                            newRole = ROLE_ARRAY.find(item => item.level === level.level);

                            // remove old role
                            if (oldRole) {
                                let roleToRemove = interaction.guild.roles.cache.get(oldRole.roleId);
                                if (roleToRemove) {
                                    await member.roles.remove(roleToRemove);
                                }
                            }

                            // add new role
                            if (newRole) {
                                let roleToAdd = interaction.guild.roles.cache.get(newRole.roleId);
                                if (roleToAdd) {
                                    await member.roles.add(roleToAdd);
                                }
                            }
                        }
                    }

                    // save
                    try {
                        await level.save();
                    } catch (e) {
                        console.log(`Error running set-xp command: ${e}`);
                        return interaction.reply({
                            content: 'Error saving updated XP. Please run the command again.',
                            ephemeral: true,
                        });
                    }

                    console.log(`${username}'s XP was set to ${level.xp} points by an admin.\nThey are now at level ${level.level}.`);
                    //reaction interaction reply

                    return interaction.reply({
                        content: `You set ${username}'s XP to ${level.xp} points.\nThey are now at level ${level.level}.`,
                        ephemeral: true,
                    });
                }

                // if they don't exist in the DB
                else {
                    // create new user
                    const newLevel = new Level({
                        userId: userId,
                        guildId: guildId,
                        xp: xpToSet,
                        level: 1,
                    });

                    // increase level 
                    while (newLevel.xp > calculateLevelXp(newLevel.level) && newLevel.level <= 2) {
                        newLevel.level += 1;
                    }
                    // decrease level
                    while (newLevel.xp < calculateLevelXp(newLevel.level - 1) && newLevel.level > 1) {
                        newLevel.level -= 1;
                    }

                    // save
                    try {
                        await newLevel.save();
                    } catch (e) {
                        console.log(`Error running set-xp command: ${e}`);
                        return interaction.reply({
                            content: 'Error creating user. Please run the command again.',
                            ephemeral: true,
                        });
                    }

                    console.log(`${username}'s XP was set to ${newLevel.xp} points by an admin.\nThey are now at level ${newLevel.level}.`);

                    return interaction.reply({
                        content: `You initialized ${username}'s XP to ${newLevel.xp} points.\nThey are now at level ${newLevel.level}.`,
                        ephemeral: true,
                    });
                };

            } catch (error) {
                console.error(`Error setting XP for user ${userId}: ${error}`);
                interaction.reply({
                    content: `Sorry, I couldn't set the XP for ${username}.\nPlease try again.`,
                    ephemeral: true,
                });
            }
        }
    },
};
