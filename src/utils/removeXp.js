const Level = require('../models/Level');
const calculateLevelXp = require('../utils/calculateLevelXp');

module.exports = async (reaction, xpToTake, op, op_name, reactor, reactor_name, guildId) => {

    const query = {
        userId: op,
        guildId: guildId,
    };

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

    try {   
        const level = await Level.findOne(query);
        let flag = 0;
        
        // if they exist in the DB
        if (level) {

            // so that we don't let XP fall below 0
            if (level.xp-xpToTake < 0) return;
            level.xp -= xpToTake;
            if (level.xp < calculateLevelXp(level.level-1) && level.level >1) {
                flag = 1;
                const memberRole = ROLE_ARRAY.find(item => item.level === level.level);

                let member = reaction.message.guild.members.cache.get(op);

                if (memberRole) {
                    // remove old role
                    let role = reaction.message.guild.roles.cache.get(memberRole.roleId);
                    if (role && member) {
                        member.roles.remove(role);
                    }
                }

                level.level -= 1;
                flag = 1;  

                // add the new role
                const newMemberRole = ROLE_ARRAY.find(item => item.level === level.level);
                if (newMemberRole) {
                    let newRole = reaction.message.guild.roles.cache.get(newMemberRole.roleId);
                    if (newRole && member) {
                        member.roles.add(newRole);
                    }
                }
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