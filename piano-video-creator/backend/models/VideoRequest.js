const mongoose = require('mongoose');

const videoRequestSchema = new mongoose.Schema({
  titleOrUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  videoUrl: { type: String }, // URL locale ou Cloud du fichier mp4 final
  thumbnailUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VideoRequest', videoRequestSchema);
