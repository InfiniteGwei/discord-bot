const Level = require('../models/Level');
const calculateLevelXp = require('../utils/calculateLevelXp');

module.exports = async (reaction, xpToTake, op, op_name, reactor, reactor_name, guildId) => {

    const query = {
        userId: op,
        guildId: guildId,
    };

    try {   
        const level = await Level.findOne(query);
        let flag = 0;
        
        // if they exist in the DB
        if (level) {

            // so that we don't let XP fall below 0
            if (level.xp-xpToTake < 0) return;
            level.xp -= xpToTake;
            // TODO give role to member
        
            if (level.xp < calculateLevelXp(level.level-1) && level.level >1) {
                level.level -= 1;
                flag = 1;
            }
        
            try {
                await level.save();
            } catch (e) {
                console.log(`Error saving updates: ${e}`);
                reaction.message.channel.send(`<@${reactor}>, we ran into an error 😔\nPlease remove 3 XP points using \`/set-xp\`.`);
                return;
            }
        
            if (flag === 1) {
                //TODO `They now have the {$newRole} role.`
                reaction.message.channel.send(`<@${op}>, you are now at level ${level.level} with ${level.xp} points.`);
            }

            console.log(`${reactor} decreased ${op}'s XP to ${level.xp} points.\n${op} is now at level ${level.level}.`);
        }

    } catch (error) {
        console.log(`Error taking xp: ${error}`);
    };
};