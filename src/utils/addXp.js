const Level = require('../models/Level');
const calculateLevelXp = require('../utils/calculateLevelXp');

module.exports = async (reaction, xpToGive, op, op_name, reactor, reactor_name, guildId) => {

    const query = {
        userId: op,
        guildId: guildId,
    };

    try {   
        const level = await Level.findOne(query);
        
        // if they exist in the DB
        if (level) {
            level.xp += xpToGive;
            // TODO give role to member
            console.log(`${reactor} increased ${op}'s XP to ${level.xp} points.`);
            

            if (level.xp > calculateLevelXp(level.level) && level.level<=2) {
                level.level +=1;
                //TODO `They now have the {$newRole} role.`
                reaction.message.channel.send(`<@${op}>, you reached level ${level.level} with ${level.xp} points!`);
                
            }

            await level.save().catch((e) => {
                console.log(`Error saving updated level: ${e}`);
                return;
            });
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

            console.log(`${reactor} initialized ${op}'s XP to ${newLevel.xp} points.`);

            reaction.message.channel.send(`Congratulations <@${op}>! You just received ${xpToGive} XP points for the first time.`);
        
            await newLevel.save();
            console.log('New item made and saved.');
                                    
    };
    } catch (error) {
        console.log(`Error giving xp: ${error}`);
    };
    
};