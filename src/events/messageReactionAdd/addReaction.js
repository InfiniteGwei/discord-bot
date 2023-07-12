const { Client, Message } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const processedReactions = new Set();


/**
 *
 * @param {Client} client
 * @param {Message} message
 */

const targetReaction = '💯';

module.exports = async (client, reaction, user) => {
    console.log('Function called');
    const op = reaction.message.author.id;

    const reactor = user.id;
    const xpToGive = 3;

    console.log(`op is ${op}`);
    console.log(`reactor is ${reactor}`);
    //console.log(user.fetch());

    if (op !== reactor) {
        if (reaction.emoji.name === targetReaction) {
            const requiredRoleId = ["1125833838178877510", "1125833870898626673"];
            const guildMember = reaction.message.guild?.members.cache.get(reactor);

            if (!guildMember) return;

            const hasRole = requiredRoleId.some((roleId) => guildMember.roles.cache.has(roleId));

            console.log(hasRole);
            if (hasRole) {
                console.log(` have role`);
                
                const query = {
                    userId: op,
                    guildId: reaction.message.guild.id,
                };

                try {   console.log("Finding level with query: ", query);
                        const level = await Level.findOne(query);
                        console.log("Found level: ", level);
                    
                    // if they exist in the DB
                        if (level) {
                            level.xp += xpToGive;
                            console.log(`${reactor} increased ${op}'s XP to ${level.xp} points.`);

                            if (level.xp > calculateLevelXp(level.level) && level.level<=2) {
                                level.level +=1;
                                reaction.message.channel.send(`${op} has reached level ${level.level} with ${level.xp} points.`);
                            }

                            await level.save().catch((e) => {
                                console.log(`Error saving updated level ${e}`);
                                return;
                            });
                        }
                    
                    // if they don't exist in the DB
                    else {
                        // create new level
                        const newLevel = new Level({
                          userId: op,
                          guildId: reaction.message.guild.id,
                          xp: xpToGive,
                          level: 1,
                        });

                        console.log(`${reactor} set ${op}'s XP to ${newLevel.xp} points.`);

                        reaction.message.channel.send(`Congratulations ${op}! You just received ${xpToGive} XP points for the first time.`);
                  
                        await newLevel.save();
                        console.log('New item made and saved.');
                                               
                };
             } catch (error) {
                    console.log(`Error giving xp: ${error}`);
                }

            } else {console.log(`reactor does not have the right role!`);};
        }
    }
};