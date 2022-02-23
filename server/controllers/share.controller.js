const fs = require('fs');
const { Project } = require('../models/project.model');
const {google} = require('googleapis');
const categoryIds = 22;
const AWS = require('aws-sdk');
const SCOPES = "https://www.googleapis.com/auth/youtube.upload";
const oAuth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_SECRET,
  process.env.REDIRECT_URL
);
let authed = false;

exports.authYouTube = async (req, res) => {
  if (!authed) {
    // Generate an OAuth URL and redirect there
    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log(url);
    return res.status(200).json({url});
  } else {
    const oauth2 = await google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    await oauth2.userinfo.get(function (err, response) {
      if (err) {
        console.log(err);
        authed = false
      } else {
        console.log(response.data);
        return res.status(200).json({user: response.data})
      }
    });
  }
}

exports.uploadYouTube = (req, res) => {
  const {path, name, thumbnail, code} = req.body;
  
  if (code) {
    // Get an access token based on our OAuth code
    oAuth2Client.getToken(code, function (err, tokens) {
      if (err) {
        console.log(err);
        authed = false
      } else {
        console.log("Successfully authenticated");
        console.log(tokens);
        oAuth2Client.setCredentials(tokens);
        authed = true;
        const youtube = google.youtube({ version: "v3", auth: oAuth2Client });
        youtube.videos.insert({
            part: 'snippet,status',
            requestBody: {
              snippet: {
                title: name,
                
                categoryId: categoryIds,
                defaultLanguage: 'en',
                defaultAudioLanguage: 'en'
              },
              status: {
                privacyStatus: "public"
              },
            },
            media: {
              body: fs.createReadStream(path),
            },
          },
          (err, data) => {
            if(err) throw err
            console.log(data)
            console.log("Done.");
            res.status(200).json({data})
          }
        );
      }
      })
    }
  
}

exports.downloadFile = (req, res) => { 
  const { project_id, bucket, mediaName } = req.params;
  const key = `${project_id}/${bucket}/${mediaName}`
  AWS.config.update(
    {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: 'us-east-2'

    }
  );
  var s3 = new AWS.S3();
  const params = {Bucket:'provid', Key:key}
  res.attachment(key);
  var fileStream = s3.getObject(params).createReadStream();
  fileStream.pipe(res);

  Project.findByIdAndUpdate({ _id: project_id }, { $set: { projectStatus: "Done" } },
    (err, data) => {
      if (err)
        return res.status(400).send({ msg: `Database Error ${err}` });
    })
}


