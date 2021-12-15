const FFmpeg = require('fluent-ffmpeg');

module.exports = (req, res, next) => {
  FFmpeg.ffprobe(req.body.link, async (err, meta) => {

    let supported = false;
    let isImage = false;
    let mediaType = '';
    switch ((meta.streams[0].codec_type).toLowerCase()) {
      // case 'av1':
      // case 'h264':
      // case 'h263':
      // case 'h265':
      // case 'mp4v-es':
      // case 'mpeg-1':
      // case 'mpeg-2':
      // case 'theora':
      // case 'vp8':
      // case 'vp9':
      // case 'aac':
      case 'video':
        supported = true;
        mediaType = "Video";
    }
    switch ((meta.streams[0].codec_type).toLowerCase()) {
      // case 'pcm':
      // case 'wav':
      // case 'aiff':
      // case 'mp3':
      // case 'acc':
      // case 'ogg':
      // case 'wma':
      // case 'flac':
      // case 'alac':
      // case 'wma':
      case 'audio':
        supported = true;
        mediaType = "Audio";
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
        mediaType = "Image";
    }

    if (!isImage) {
      req.preDuration = (meta.format.duration).toFixed(0);
    }
    req.supported = supported;
    req.isImage = isImage;
    req.mediaType = mediaType;
    next()
  })
}