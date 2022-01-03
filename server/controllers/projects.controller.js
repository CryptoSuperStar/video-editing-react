const { Project } = require('../models/project.model');
const aws = require('aws-sdk');
const fs = require('fs');
const { unlink } = require('fs/promises');
const FFmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { User } = require('../models/user.model');
require("moment-duration-format");
const MEDIA_SRC = 'client/build';
// const MEDIA_SRC = 'client/public';

function clearTemp(link) {
  if (fs.existsSync(link)) {
    fs.rmSync(link, { recursive: true, force: true });
  }
  return true;
}

exports.createTempProjectController = async (req, res) => {
  let { link, bucket } = req.body;
  const _id = req.userId;
  const supported = req.supported;
  const isImage = req.isImage;
  try {
    let mediaName = link.split('/');
    mediaName = mediaName[mediaName.length - 1];
    let projectName;
    await Project.find({ author: req.userId }, async (err, projects) => {
      let count = projects.length ? (projects?.[projects.length - 1].projectName).split('#') : [];
      count = parseInt(count?.[count.length - 1], 10)
      projectName = `Project #${count >= projects.length ? count + 1 : projects.length + 1}`;
      let project = new Project({
        projectName: projectName,
        bucket,
        content: [{
          mediaSrc: link,
          mediaName: mediaName,
          mediaType: req.mediaType,
          isImage,
          duration: req.preDuration,
          endTime: req.preDuration,
          isSupported: supported
        }],
        author: _id
      });
      await project.save(((err, doc) => {
        if (err) return res.status(400).send({ msg: `Database Error ${err}` });
        console.log(doc);
        return res.status(200).json({ project: doc, currentMedia: doc.content[0]._id, isImage, mediaType: req.mediaType, });
      }));
    });


  } catch (e) {
    console.log(e);
    return res.status(500).send({ msg: e });
  }
};

exports.takeScreenShotController = async (req, res) => {
  const userId = req.body.id;
  const { preDuration } = req;
  const { link, id, name, bucket } = req.body;
  if (!fs.existsSync(`${MEDIA_SRC}/temp`)) {
    await fs.mkdirSync(`${MEDIA_SRC}/temp`);
  }
  if (!fs.existsSync(`${MEDIA_SRC}/temp/${userId}`)) {
    await fs.mkdirSync(`${MEDIA_SRC}/temp/${userId}`);
  }
  if (!fs.existsSync(`${MEDIA_SRC}/temp/${userId}/${bucket}`)) {
    await fs.mkdirSync(`${MEDIA_SRC}/temp/${userId}/${bucket}`);
  }
  let newName = link.split('/');
  newName = newName[newName.length - 1]
  let duration = preDuration;
  let quantity = '';
  if (duration <= 30) {
    quantity = 6;
  } else if (duration > 30 && duration <= 60) {
    quantity = 7;
  } else {
    quantity = 9;
  }
  let stepInSeconds = duration / quantity;
  try {
    FFmpeg(link)
      .seekInput(0)
      .output(`${MEDIA_SRC}/temp/${userId}/${bucket}/${newName}-%01d.jpg`)
      .outputOptions('-vf', `fps=1/${stepInSeconds},scale=-1:120`)
      .on('progress', function (progress) {
        console.log(progress.percent)
      })
      .on('end', function () {
        console.log('Screenshots taken');
        try {
          aws.config.update({
            region: 'us-east-2',
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
          })
          const s3 = new aws.S3();
          let newScreensArray = [];
          let screens = [...Array(quantity)].map(async (item, i) => {
            let timeInFormat = moment.duration((stepInSeconds * (i + 1) - (stepInSeconds / 2)), 'seconds')
              .format("mm:ss:SSS", { trim: false })

            const fileContent = await fs.readFileSync(`${MEDIA_SRC}/temp/${userId}/${bucket}/${newName}-${i + 1}.jpg`);
            let params = {
              Bucket: `${process.env.AWS_BUCKET}/${userId}/${bucket}`,
              Key: `${newName}-${i + 1}.jpg`,
              Body: fileContent
            }
            let uploadedVideo = await s3.upload(params).promise();
            if (!uploadedVideo) console.log("Something went wrong to upload file to AWS");
            newScreensArray.push({
              screenSrc: uploadedVideo.Location,
              timeInSeconds: (stepInSeconds * (i + 1) - (stepInSeconds / 2)),
              time: timeInFormat,
            })
          })
          let user;
          (async () => {
            user = await User.findById(req.userId)
          })();

          Promise.all(screens).then(() => {
            Project.findById({ _id: id }, (err, project) => {

              if (err) return res.status(400).send({ msg: `Database Error ${err.message}` });
              const editedProject = project.editedProjects.length > 0 ? project.editedProjects.find(item => item.revision === project.projectRevision) : false
              if ((project.projectStatus === "Complete" && editedProject)) {
                let currentEditedProjects = project.editedProjects.map(item => {
                  return item.revision === project.projectRevision ? {
                    _id: item._id,
                    mediaName: item.mediaName,
                    mediaSrc: item.mediaSrc,
                    mediaType: item.mediaType,
                    revision: item.revision,
                    duration: duration,
                    endTime: duration,
                    screens: newScreensArray,
                    isSupported: req.supported,
                    isImage: req.isImage
                  } : item
                })
                Project.findByIdAndUpdate({ _id: id }, { $set: { editedProjects: currentEditedProjects } }, { new: true },
                  (err, data) => {
                    if (err) return res.status(400).send({ msg: `Database Error ${err}` });
                    clearTemp(`${MEDIA_SRC}/temp/${userId}/${bucket}`);
                    return res.status(200).json({ project: data })
                  })
              } else if (user.userRole === "editor" && project.tempEditedMedia?.mediaSrc) {
                let currentContent = {
                  _id: project.tempEditedMedia._id,
                  mediaName: project.tempEditedMedia.mediaName,
                  mediaSrc: project.tempEditedMedia.mediaSrc,
                  mediaType: project.tempEditedMedia.mediaType,
                  duration: duration,
                  endTime: duration,
                  screens: newScreensArray,
                  isSupported: project.tempEditedMedia.isSupported,
                  isImage: project.tempEditedMedia.isImage
                }
                Project.findByIdAndUpdate({ _id: id }, { $set: { tempEditedMedia: currentContent } }, { new: true },
                  (err, data) => {
                    if (err) return res.status(400).send({ msg: `Database Error ${err}` });
                    clearTemp(`${MEDIA_SRC}/temp/${userId}/${bucket}`);
                    return res.status(200).json({ project: data })
                  })
              } else {
                let currentContent = project.content.map(item => {
                  return item.mediaName === newName ? {
                    _id: item._id,
                    mediaName: item.mediaName,
                    mediaSrc: item.mediaSrc,
                    mediaType: item.mediaType,
                    duration: duration,
                    endTime: duration,
                    screens: newScreensArray,
                    isSupported: item.isSupported,
                    isImage: item.isImage
                  } : item
                })
                Project.findByIdAndUpdate({ _id: id }, { $set: { content: currentContent } }, { new: true },
                  (err, data) => {
                    if (err) return res.status(400).send({ msg: `Database Error ${err}` });
                    clearTemp(`${MEDIA_SRC}/temp/${userId}/${bucket}`);
                    return res.status(200).json({ project: data })
                  })
              }
            })
          })

        } catch (e) {
          console.log(e);
          return res.status(500).send({ msg: e });
        }
      })
      .run()
  } catch (e) {
    console.log(e);
    return res.status(500).send({ msg: e });
  }
}

exports.getProject = async (req, res) => {
  const _id = req.params.id;
  try {
    await Project.findById(_id, (err, project) => {
      if (err) return res.status(400).send({ msg: err.status });
      return res.status(200).json({ project });
    })
  } catch (e) {
    console.log(e);
    return res.status(500).send({ msg: e.message })
  }
}

exports.clearTempProject = async (req, res) => {
  const { projectId, bucket } = req.params;
  const { _id } = req.userId;
  try {
    Project.findByIdAndDelete(projectId).exec(async (err, project) => {
      aws.config.update({
        region: 'us-east-2',
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      })
      const s3 = new aws.S3();
      const params = {
        Bucket: `${process.env.AWS_BUCKET}/${_id}/${bucket}`,
        Key: project.projectName
      };
      try {

        async function emptyS3Directory(bucket, dir) {
          const listParams = {
            Bucket: bucket,
            Prefix: dir
          };

          const listedObjects = await s3.listObjectsV2(listParams).promise();

          if (listedObjects.Contents.length === 0) return;

          const deleteParams = {
            Bucket: bucket,
            Delete: { Objects: [] }
          };

          listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
          });

          await s3.deleteObjects(deleteParams).promise();

          if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
        }
        await emptyS3Directory(process.env.AWS_BUCKET, `${_id}/${bucket}`)

        await s3.deleteObject(params).promise();
        console.log("project deleted");
        return res.status(200).send({});
      }
      catch (err) {
        console.log("ERROR in file Deleting : " + JSON.stringify(err))
        return res.status(500).send({ msg: err });
      }
    })

  } catch (e) {
    return res.status(500).send({ msg: e.message })
  }
}

exports.cutTempProjectController = async (req, res) => {
  const { path, name, startTime, endTime, projectId } = req.body;
  const { _id } = req.userId;
  const startTimeInSeconds = moment.duration(startTime).asMilliseconds();
  const endTimeInSeconds = moment.duration(endTime).asMilliseconds();
  const duration = endTimeInSeconds - startTimeInSeconds;
  let newName = uuidv4() + "-" + name;
  try {
    new FFmpeg({ source: path })
      .setStartTime(startTimeInSeconds)
      .setDuration(duration)
      .saveToFile(newName)
      .withVideoCodec('copy')
      .withAudioCodec('copy')
      .on('start', function () { })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message);
      })
      .on('end', async function () {
        console.log('Successfully edited a new video ');
        aws.config.update({
          region: 'us-east-2',
          accessKeyId: process.env.AWS_KEY,
          secretAccessKey: process.env.AWS_SECRET_KEY
        })
        const s3 = new aws.S3();
        const fileContent = await fs.readFileSync(newName);
        let params = {
          Bucket: `${process.env.AWS_BUCKET}/${_id}`,
          Key: newName,
          Body: fileContent
        }
        let uploadedVideo = await s3.upload(params).promise();
        if (!uploadedVideo) return res.status(400).send({ msg: "Something went wrong to upload file to AWS" })
        await unlink(newName);
        await Project.findById(projectId, async (err, doc) => {
          if (err) return res.status(400).send({ msg: err.status });
          let content = doc.content.map(item => {
            return item.mediaName === name ? {
              _id: item._id,
              mediaName: item.mediaName,
              mediaSrc: `https://provid.s3.us-east-2.amazonaws.com/${uploadedVideo.Key}`,
              screens: [],
              duration: duration
            } : item
          });
          await Project.findByIdAndUpdate(projectId, { $set: { content: content } },
            { new: true }, (err, proj) => {
              if (err) return res.status(400).send({ msg: err });
              return res.status(200).json({ project: proj });
            })
        })
      })
  } catch (e) {
    return res.status(500).send({ msg: e.message })
  }
}

exports.createProjectController = async (req, res) => {
  const { project } = req.body;
  const user = await User.findById(req.userId);
  try {
    let currentEditedProjects = [];
    let status;
    let projectRevision;
    const updateProject = () => {
      let newerProject = {
        ...project,
        themeName: project.styleInspiration.platform,
        isPublished: true,
        projectStatus: status,
        projectRevision: projectRevision
      };
      Project.findByIdAndUpdate(project._id, { $set: newerProject }, { new: true },
        (err, prj) => {
          if (err) return res.status(400).send({ msg: err });
          return res.status(200).json({})
        })
    }
    await Project.findById(project._id, (err, oldProject) => {
      if (user.userRole === 'editor') {
        if (project.tempEditedMedia?.mediaSrc) {
          status = "Complete";
          projectRevision = oldProject?.projectRevision;
          if (project?.editedProjects.length > 0) {
            currentEditedProjects = project.editedProjects.map(item => {
              return item.revision === project.projectRevision ? { ...project.tempEditedMedia, comments: item.comments, revision: item.revision } : item
            })
          } else { currentEditedProjects = [{ ...project.tempEditedMedia, revision: 0 }] };
          project.editedProjects = currentEditedProjects;
          project.tempEditedMedia = {}
          updateProject();
        }
        else {
          return res.status(400).send({ msg: "You haven't uploaded edited media yet" })
        }
      } else {
        status = oldProject?.projectStatus === "Draft" ? "In Progress" : "In Revision";
        projectRevision = oldProject?.projectStatus === "Draft" ? 0 : oldProject?.projectRevision + 1;
        updateProject();
      }
    })


  } catch (e) {
    console.log(e);
    return res.status(400).send({ msg: e.message })
  }
}

exports.updateProject = async (req, res) => {
  const { projectId, styleInspiration } = req.body;
  Project.findByIdAndUpdate(projectId, { $set: { styleInspiration: styleInspiration } }, { new: true })
    .exec((err, project) => {
      if (err || !project) return res.status(400).send({ msg: err.message });
      return res.status(200).json({ project })
    })
}

exports.getProjects = async (req, res) => {
  const user = await User.findById(req.userId);
  if (user.userRole === "editor") {
    const customer = await User.find({ promocode: user.promocode, userRole: 'customer' }, '_id userName');

    try {
      const projects = await Promise.all(customer.map(async item => {
        const project = await Project.find({ author: item._id, projectStatus: { $in: ["In Progress", "In Revision", "Complete", "Done"] } });
        return {
          _id: item._id,
          userName: item.userName,
          project: project
        }
      }))
      return res.status(200).json({ projects });
      // await Project.find({ author: { $in: customerId } }, (err, projects) => {
      //   if (err) return res.status(400).send({ msg: err.status });
      //   return res.status(200).json({ projects });
      // })
    } catch (e) {
      console.log(e);
      return res.status(500).send({ msg: e.message })
    }
  } else {

    try {
      await Project.find({ author: req.userId }, (err, projects) => {
        if (err) return res.status(400).send({ msg: err.status });
        return res.status(200).json({ projects });
      })
    } catch (e) {
      console.log(e);
      return res.status(500).send({ msg: e.message })
    }
  }
}

exports.addMediaToProject = async (req, res) => {
  let { projectId, link } = req.body;
  const supported = req.supported;
  const isImage = req.isImage;
  const user = await User.findById(req.userId);
  const project = await Project.findById({ _id: projectId });
  console.log(project);

  try {
    let name = link.split('/');
    name = name[name.length - 1];
    const newContent = {
      mediaSrc: link,
      mediaName: name,
      mediaType: req.mediaType,
      isImage,
      duration: req.preDuration,
      endTime: req.preDuration,
      isSupported: supported
    }

    Project.findByIdAndUpdate(projectId, user.userRole === "editor" ? { $set: { tempEditedMedia: newContent } } : { $push: { content: newContent } }, { new: true },
      (err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).send({ msg: err });
        }
        let currentMedia = user.userRole === "editor" ? data.tempEditedMedia : data.content[data.content.length - 1];
        return res.status(200).json({ project: data, currentMedia: currentMedia, isImage, mediaType: req.mediaType, })
      })
  } catch (e) {
    console.log(e);
    return res.status(400).send({ msg: e.message })
  }
}

exports.updateCommentsController = async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;
  try {
    Project.findByIdAndUpdate(projectId, { $set: { content: content } }, { new: true }, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ msg: err });
      }
      return res.status(200).json({ project: data });
    })
  } catch (e) {
    console.log(e);
    return res.status(400).send({ msg: e.message })
  }
}

exports.deleteVideo = async (req, res) => {
  const { projectId } = req.params;
  const { _id } = req.userId;
  const { newContent, videoInfo, bucket } = req.body;
  const path = `${MEDIA_SRC}/temp/${_id}/${bucket}`;

  try {

    if (fs.existsSync(path)) {
      videoInfo.screens.map(screen => {
        fs.unlinkSync(`${MEDIA_SRC}/${screen.screenSrc}`);
      })
    }

    aws.config.update({
      region: 'us-east-2',
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    })
    const s3 = new aws.S3();
    const params = {
      Bucket: `${process.env.AWS_BUCKET}/${_id}/${bucket}`,
      Key: videoInfo.mediaName
    };
    Project.findByIdAndUpdate(projectId, { $set: { content: newContent } }, { new: true }, (err, project) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ msg: err });
      }
      s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);  // error
        return res.status(200).json({ project });
      });
    })
  } catch (e) {
    console.log(e);
    return res.status(400).send({ msg: e.message })
  }
}