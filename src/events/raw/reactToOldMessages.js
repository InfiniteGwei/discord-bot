module.exports = async (client, packet) => {

    if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return;
  
    const channel = await client.channels.fetch(packet.d.channel_id);
    if (channel.messages.cache.has(packet.d.message_id)) return;
  
    const message = await channel.messages.fetch(packet.d.message_id);
    const reaction = message.reactions.cache.get(packet.d.emoji.name);
    client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
  };