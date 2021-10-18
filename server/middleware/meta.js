const FFmpeg = require('fluent-ffmpeg');

module.exports = (req, res, next) => {
  FFmpeg.ffprobe(req.body.link, async (err, meta)=>{
    
    let supported = false;
    let isImage = false;
    switch ((meta.streams[0].codec_name).toLowerCase()) {
      case 'av1':
      case 'h264':
      case 'h263':
      case 'h265':
      case 'mp4v-es':
      case 'mpeg-1':
      case 'mpeg-2':
      case 'theora':
      case 'vp8':
      case 'vp9':
        supported = true;
    }
  
    switch ((meta.streams[0].codec_name).toLowerCase()) {
      case 'mjpeg':
      case 'png':
      case 'apng':
      case 'avif':
      case 'gif':
      case 'jpeg':
      case 'svg':
      case 'webp':
      case 'bmp':
      case 'ico':
      case 'tiff':
        isImage = true;
    }
    if (!isImage) {
      req.preDuration = (meta.format.duration).toFixed(0);
    }
    req.supported = supported;
    req.isImage = isImage;
    next()
  })
}