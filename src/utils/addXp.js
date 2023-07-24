const Level = require('../models/Level');
const calculateLevelXp = require('../utils/calculateLevelXp');

module.exports = async (reaction, xpToGive, op, op_name, reactor, reactor_name, guildId) => {

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
            level.xp += xpToGive;
        
            if (level.xp > calculateLevelXp(level.level) && level.level <= 4) {
                level.level += 1;
                flag = 1;
                
                const memberRole = ROLE_ARRAY.find(item => item.level === level.level);

                if (!reaction.message.guild) {
                    console.log("Error: Guild not found");
                    return;
                }

                let role = reaction.message.guild.roles.cache.get(memberRole.roleId);
                let member = reaction.message.guild.members.cache.get(op);

                if (!role) {
                    console.log(`Error: Role with id ${memberRole.roleId} not found`);
                }
        
                if (!member) {
                    console.log(`Error: Member with id ${op} not found`);
                }
                
                if (memberRole) {
                    for (const roleObj of ROLE_ARRAY) {
                        if (roleObj.level !== level.level) {
                            let oldRole = reaction.message.guild.roles.cache.get(roleObj.roleId);
                            if (oldRole && member.roles.cache.has(oldRole.id)) {
                                member.roles.remove(oldRole);
                            }
                        }
                    }
                    
                    if (role && member) {
                        member.roles.add(role);
                    }
                }
            }

            try {
                await level.save();
            } catch (e) {
                console.log(`Error saving updates: ${e}`);
                reaction.message.channel.send(`<@${reactor}>, we ran into an error 😔\nPlease add 3 XP points using \`/set-xp\`.`);
                return;
            }
        
            if (flag === 1) {
                //xxx `They now have the {$newRole} role.`
                reaction.message.channel.send(`<@${op}>, you reached level ${level.level} with ${level.xp} points!`);
            }

            console.log(`${reactor} increased ${op}'s XP to ${level.xp} points.\n${op} is now at level ${level.level}.`);
        }
        
        // if they don't exist in the DB
        else {
            // create new user
            const newLevel = new Level({
                userId: op,
                guildId: guildId,
                xp: xpToGive,
                level: 1,
            });

            const memberRole = ROLE_ARRAY.find(item => item.level === newLevel.level);
                
            if (memberRole) {
                let role = reaction.message.guild.roles.cache.get(memberRole.roleId);
                let member = reaction.message.guild.members.cache.get(op);
                if (role && member) {
                    member.roles.add(role);
                }
            }

            try {
                await newLevel.save();
            } catch (e) {
                console.log(`Error initializing user: ${e}`);
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