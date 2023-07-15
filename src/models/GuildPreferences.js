const {Schema, model} = require('mongoose');

const GuildPreferencesSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  baseXp: { type: Number, required: false },
  levels: { type: Number, required: false },
  levelingSchema: [{
    level: Number,
    minXP: Number,
    roleId: String,
  }],
});

module.exports = model('GuildPreferences', GuildPreferencesSchema);