const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  comments: {
    type: {
      text: String,
      rawTime: String,
      time: String,
      createdAt: Date
    }
  },
  mediaSrc: String,
  mediaName: String,
  duration: String,
  comment: String,
  isSupported: {
    type: Boolean,
    default: false
  },
  isImage: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    default: 0
  },
  endTime: String,
  screens: [{
    screenSrc: String,
    time: String,
    timeInSeconds: String,
    comment: {
      type: {
        text: String,
        time: String,
        createdAt: Date
      }
    }
  }]
})

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    trim: true
  },
  themeName: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  typeMedia: String,
  bucket: String,
  content: [ContentSchema],
  styleInspiration: {
    type: {
      link: String,
      platform: String,
      linkToUserPost: String,
      linkToExternalPost: String
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

const Project = mongoose.model('Project', projectSchema);
module.exports = { Project };