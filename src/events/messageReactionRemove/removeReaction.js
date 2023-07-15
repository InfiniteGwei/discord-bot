// TODO take targetReaction, xpToTake and requiredRoleIds from user
//TODO Also, what roles to take at what levels? Add them here, and then add them as a paramter in removeXp.js, and make sure you send it by adding it in line 33.
const targetReaction = '💯';
const xpToTake = 3;
const requiredRoleId = ["1125833838178877510", "1125833870898626673"];

const removeXp = require('../../utils/removeXp');

module.exports = async (client, reaction, user) => {

    const op = reaction.message.author.id;
    const op_name = reaction.message.author.username;

    // console.log(`----`);
    // console.log(user.id);
    const reactor = user.id;
    const reactor_name = user.username;
    
    // Reactor should be removing the right emoji
    if (reaction.emoji.name !== targetReaction) return;
    
    // Reactor should have the right roles
    const guildMember = reaction.message.guild?.members.cache.get(reactor);
    const hasRole = requiredRoleId.some((roleId) => guildMember.roles.cache.has(roleId));
    if (!hasRole) return;
    
    removeXp(reaction, xpToTake, op, op_name, reactor, reactor_name, reaction.message.guild.id);
};