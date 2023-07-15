// module.exports = async (client, packet) => {

//   if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
//   const channel =  await client.channels.fetch(packet.d.channel_id);
//   if (channel.messages.cache.has(packet.d.message_id)) return;

//   const message =  await channel.messages.fetch(packet.d.message_id);
//   const reaction = message.reactions.cache.get(packet.d.emoji.name);
//     client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));

//   } else if (['MESSAGE_REACTION_REMOVE'].includes(packet.t)) {
//       const channel =  await client.channels.fetch(packet.d.channel_id);
//       //if (channel.messages.cache.has(packet.d.message_id)) return;

//       const message =  await channel.messages.fetch(packet.d.message_id);
//       const reaction = message.reactions.cache.get(packet.d.emoji.name);
//     client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
  
//   }
// };

// module.exports = async (client, packet) => {

//   if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
//     const channel = await client.channels.fetch(packet.d.channel_id);
//     if (channel.messages.cache.has(packet.d.message_id)) return;
  
//     const message = await channel.messages.fetch(packet.d.message_id);
//     const reaction = message.reactions.cache.get(packet.d.emoji.name);

//     client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
// }
//   else if (['MESSAGE_REACTION_REMOVE'].includes(packet.t)) {
//     const channel = await client.channels.fetch(packet.d.channel_id);
//     if (channel.messages.cache.has(packet.d.message_id)) return;
  
//     const message = await channel.messages.fetch(packet.d.message_id);
//     const reaction = message.reactions.cache.get(packet.d.emoji.name);
//     client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
// }
// };

module.exports = async (client, packet) => {
  if (['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) {
    const channel = await client.channels.fetch(packet.d.channel_id);
    if (channel.messages.cache.has(packet.d.message_id)) return;

    const message = await channel.messages.fetch(packet.d.message_id);
    const reaction = message.reactions.cache.get(packet.d.emoji.name);

    // console.log(reaction);

    if (packet.t === 'MESSAGE_REACTION_ADD') {
      client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
    } 
    else if (packet.t === 'MESSAGE_REACTION_REMOVE') {
      client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
    }
  }
};

// module.exports = async (client, packet) => {
//   if (['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) {
//     const channel = await client.channels.fetch(packet.d.channel_id);
//     if (channel.messages.cache.has(packet.d.message_id)) return;

//     const message = await channel.messages.fetch(packet.d.message_id);
//     let reaction = message.reactions.cache.get(packet.d.emoji.name);

//     if (!reaction) {
//       // Fetch reaction from API if not in cache
//       reaction = await message.reactions.fetch(packet.d.emoji.name);
//     }

//     console.log(reaction);


//     if (packet.t === 'MESSAGE_REACTION_ADD') {
//       client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
//     } else if (packet.t === 'MESSAGE_REACTION_REMOVE') {
//       client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
//     }
//   }
// };

// module.exports = async (client, packet) => {
//   if (['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) {
//     const channel = await client.channels.fetch(packet.d.channel_id);
//     let message;
//     if (channel.messages.cache.has(packet.d.message_id)) {
//       message = channel.messages.cache.get(packet.d.message_id);
//     } else {
//       message = await channel.messages.fetch(packet.d.message_id);
//     }
//     let reaction = message.reactions.cache.get(packet.d.emoji.name);

//     if (packet.t === 'MESSAGE_REACTION_ADD') {
//       client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
//     } else if (packet.t === 'MESSAGE_REACTION_REMOVE') {
//       if (!reaction) {
//         // Re-fetch the message when a reaction is removed
//         message = await channel.messages.fetch(packet.d.message_id, true, true);
//         reaction = message.reactions.cache.get(packet.d.emoji.name);
//       }
//       client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
//     }
//   }
// };

// BEST ONE, BUT REMOVING TWICE

module.exports = async (client, packet) => {
  if (['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) {
    const channel = client.channels.cache.get(packet.d.channel_id);

    if (!channel) return;

    let message = channel.messages.cache.get(packet.d.message_id);
    if (!message) {
      try {
        message = await channel.messages.fetch(packet.d.message_id);
      } catch (err) {
        console.error('Error fetching message', err);
        return;
      }
    }

    let reaction = message.reactions.cache.get(packet.d.emoji.name);
    const user = client.users.cache.get(packet.d.user_id);

    if (packet.t === 'MESSAGE_REACTION_ADD') {
      if (reaction) {
        client.emit('messageReactionAdd', reaction, user);
      }
    } else if (packet.t === 'MESSAGE_REACTION_REMOVE') {
      if (reaction) {
        client.emit('messageReactionRemove', reaction, user);
      }
    }
  }
};
