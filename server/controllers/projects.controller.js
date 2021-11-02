const { Project } = require('../models/project.model');
const aws = require('aws-sdk');
const fs = require('fs');
const { unlink } = require('fs/promises');
const FFmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
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
    let name = link.split('/');
    name = name[name.length - 1];
    let project = new Project({
      projectName: name,
      bucket,
      content: [{
        mediaSrc: link,
        mediaName: name,
        isImage,
        isSupported: supported
      }],
      author: _id
    });
    await project.save(((err, doc) => {
      if (err) return res.status(400).send({ msg: `Database Error ${err}` });
      console.log(doc);
      return res.status(200).json({ project: doc, currentMedia: doc.content[0]._id, isImage });
    }));

  } catch (e) {
    console.log(e);
    return res.status(500).send({ msg: e });
  }
};

exports.takeScreenShotController = async (req, res) => {
  const userId = req.userId;
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
              .format("hh:mm:ss", { trim: false })

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
              comment: [
                {
                  text: '',
                  time: timeInFormat,
                  createdAt: ''
                }
              ]
            })
          })
          Promise.all(screens).then(() => {
            Project.findById({ _id: id }, (err, project) => {
              if (err) return res.status(400).send({ msg: `Database Error ${err.message}` });
              let currentContent = project.content.map(item => {
                return item.mediaName === newName ? {
                  _id: item._id,
                  mediaName: item.mediaName,
                  mediaSrc: item.mediaSrc,
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
  try {
    let newerProject = {
      ...project,
      themeName: project.styleInspiration.platform,
      isPublished: true
    };
    Project.findByIdAndUpdate(project._id, { $set: newerProject }, { new: true },
      (err, prj) => {
        if (err) return res.status(400).send({ msg: err });
        return res.status(200).json({})
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

exports.addMediaToProject = async (req, res) => {
  let { projectId, link } = req.body;
  const supported = req.supported;
  const isImage = req.isImage;
  try {
    let name = link.split('/');
    name = name[name.length - 1];
    const newContent = {
      mediaSrc: link,
      mediaName: name,
      isImage,
      isSupported: supported
    }
    Project.findByIdAndUpdate(projectId, { $push: { content: newContent } }, { new: true },
      (err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).send({ msg: err });
        }
        let currentMedia = data.content[data.content.length - 1]._id;
        return res.status(200).json({ project: data, currentMedia: currentMedia, isImage })
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