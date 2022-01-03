const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  comments: [
    {
      text: String,
      rawTime: String,
      time: String,
      createdAt: Date
    }
  ],
  mediaSrc: String,
  mediaName: String,
  mediaType: String,
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
  revision: {
    type: Number,
    default: 0,
  },
  screens: [{
    screenSrc: String,
    time: String,
    timeInSeconds: String,
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
  projectStatus: {
    type: String,
    default: "Draft",
    trim: true
  },
  tempEditedMedia: ContentSchema,
  editedProjects: [ContentSchema],
  projectRevision: {
    type: Number,
    default: 0,
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