const Level = require('../models/Level');
const calculateLevelXp = require('../utils/calculateLevelXp');

module.exports = async (reaction, xpToGive, op, op_name, reactor, reactor_name, guildId) => {

    const query = {
        userId: op,
        guildId: guildId,
    };

    try {   
        const level = await Level.findOne(query);
        let flag = 0;
        
        // if they exist in the DB
        if (level) {
            level.xp += xpToGive;
            // TODO give role to member
        
            if (level.xp > calculateLevelXp(level.level) && level.level <= 2) {
                level.level += 1;
                flag = 1;
            }
        
            try {
                await level.save();
            } catch (e) {
                console.log(`Error saving updated level: ${e}`);
                reaction.message.channel.send(`<@${reactor}>, we ran into an error 😔\nPlease react again!`);
                return;
            }
        
            if (flag === 1) {
                //TODO `They now have the {$newRole} role.`
                reaction.message.channel.send(`<@${op}>, you reached level ${level.level} with ${level.xp} points!`);
            }

            console.log(`${reactor} increased ${op}'s XP to ${level.xp} points.\n${op} is now at level ${level.level}.`);
        }
        
        // if they don't exist in the DB
        else {
            // create new level
            const newLevel = new Level({
                userId: op,
                guildId: guildId,
                xp: xpToGive,
                level: 1,
            });

            try {
                await newLevel.save();
            } catch (e) {
                console.log(`Error saving updated level: ${e}`);
                reaction.message.channel.send(`<@${reactor}>, we ran into an error 😔\nPlease react again!`);
                return;
            }

            reaction.message.channel.send(`Congratulations <@${op}>! You just received ${xpToGive} XP points for the first time.`);

            console.log(`${reactor} initialized ${op}'s XP to ${newLevel.xp} points.`);
        };

    } catch (error) {
        console.log(`Error giving xp: ${error}`);
    };
};