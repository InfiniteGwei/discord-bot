// TODO take targetReaction, xpToGive and requiredRoleIds from user
//TODO Also, what roles to give at what levels? Add them here, and then add them as a paramter in addXp.js, and make sure you send it by adding it in line 33.
const targetReaction = '💯';
const xpToGive = 3;
const requiredRoleId = ["1125833838178877510", "1125833870898626673"];

const addXp = require('../../utils/addXp');
const removeXp = require('../../utils/removeXp');

module.exports = async (client, reaction, user) => {

    const op = reaction.message.author.id;
    const op_name = reaction.message.author.username;

    const reactor = user.id;
    const reactor_name = user.username;
   

    // Not necessarily required, but can helpful to prevent the bot from crashing
    const guildMember = reaction.message.guild?.members.cache.get(reactor);
    if (!guildMember) return;

    // You shouldn't be able to give XP to yourself!
    if (op === reactor) return;
    if (reaction.emoji.name !== targetReaction) return;
    
    // Finally, you should have the right roles
    const hasRole = requiredRoleId.some((roleId) => guildMember.roles.cache.has(roleId));
    if (!hasRole) return;
    
    addXp(reaction, xpToGive, op, op_name, reactor, reactor_name, reaction.message.guild.id);
};