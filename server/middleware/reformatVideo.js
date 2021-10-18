const aws = require('aws-sdk');
const fs = require('fs');
const FFmpeg = require('fluent-ffmpeg');
const { unlink } = require('fs/promises');

module.exports = async (req, res, next) => {
  let {link, bucket} = req.body;
  const {_id} = req.userId;
  if (!req.supported && !req.isImage) {
    let name = link.split('/');
    name = name[name.length - 1];
    let newName = name.split('.');
    newName.pop();
    newName = newName.join('') + '.mp4';
    try {
      FFmpeg(link)
        .videoCodec('libvpx-vp9')
        .output(newName)
        .on('progress', function (progress) {
          console.log(progress)})
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', async function() {
          console.log('file reformatted');
          aws.config.update({
            region: 'us-east-2',
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
          })
          const s3 = new aws.S3();
          let params = {
            Bucket: `${process.env.AWS_BUCKET}/${_id}/${bucket}`,
            Key: name
          };
          await s3.deleteObject(params).promise();
          const fileContent = await fs.readFileSync(newName);
          params = {
            Bucket: `${process.env.AWS_BUCKET}/${_id}/${bucket}`,
            Key: newName,
            Body: fileContent
          }
          let uploadedVideo = await s3.upload(params).promise();
          if (!uploadedVideo) console.log("Something went wrong to upload file to AWS")
          await unlink(newName);
          req.link = uploadedVideo.Location;
          req.newName = newName;
          next();
        })
        .run()
    } catch (e) {
      console.log(e);
    }
  } else next();
}