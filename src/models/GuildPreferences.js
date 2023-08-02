const { Schema, model } = require('mongoose');

const serverSettingsSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  xpPerReaction: {
    type: Number,
    default: 10,
  },
  reactionEmojis: {
    type: [String],
    default: [],
  },
  rolesCanGiveXP: {
    type: [String],
    default: [],
  },
  levelingSchema: {
    type: [{ level: Number, xpThreshold: Number, role: { type: String, default: null } }],
    default: [],
  },
  adminPassword: {
    type: String,
    required: true,
  },
});

module.exports = model('ServerSettings', serverSettingsSchema);
