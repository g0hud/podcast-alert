const mongoose = require('mongoose')

const EpisodioSchema = new mongoose.Schema({
  idDiscord: {
    type: String,
    required: true,
  },
  spotify:{
    type: String,
    required: true
  },
  createdAt:{
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Episode',EpisodioSchema)
