import React, { useRef, useState, useEffect } from 'react';
import { connect } from "react-redux";
import S3 from 'react-aws-s3';
import { v4 as uuidv4 } from 'uuid';
import uploadImage from "../../assets/img/upload_image.png";
import { REACT_APP_AWS_KEY, REACT_APP_AWS_SECRET_KEY, REACT_APP_BUCKET } from "../../utils/misc";
import { createTempProject, takeScreenshots, addMediaToProject } from "../../store/actions/project.action";
import { toast } from "react-toastify";
import DemoLayerEmpty from "../DemoLayer/DemoLayerEmpty";
import { mediaTypeVideo } from '../../utils/constant';
import Dropzone from 'react-dropzone';
import MoonLoader from "react-spinners/MoonLoader";
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import Plus2 from "../../assets/img/button.png";

const EmptyProject = (props) => {

  const fileInput = useRef();
  const [showDemo, setShowDemo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadMedia, setUploadMedia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notSupported, setNotSupported] = useState('');


  useEffect(() => {
    if (props.user.skipIntro === false) {
      setShowDemo(true)
    }
  }, [props.user.skipIntro])

  let LoadingStatus = [];


  const handleChange = (files) => {
    let unsupportedFiles = [];
    let supportedFiles = [];
    let supportedTypes = ["wav", "mp3", "aac", "ogg", "oga", "wma", "flac", "png", "gif", "avif", "apng", "jpg", "jpeg", "svg", "webp", "bmp", "ico", "tiff", "mp4", "mov"]
    for (let file of files) {
      const fileName = (file?.name)?.split('.')?.pop();
      !supportedTypes.includes(fileName.toLowerCase()) ? unsupportedFiles.push(file) : supportedFiles.push(file) ? LoadingStatus.push(1) : console.log("finished")
    }
    if (unsupportedFiles.length > 0) {
      const unsupportedFilesNames = <div>{unsupportedFiles.map((file, index) => <div>{index + 1 + '. '}{file.name}</div>)}</div>
      setNotSupported(unsupportedFilesNames);
      setUploadMedia(false);
      setShowModal(true);
    }
    LoadingStatus.length && props.setLoadingStatus(LoadingStatus);
    props.setComments([])
    if (supportedFiles.length > 0) {
      let file = supportedFiles[0];
      const fileSize = file.size / 1048576;
      const fileName = (file.name).split('.');
      if (fileSize > 2048) {
        toast.error('The File size should be less than 2GB')
      }
      if (supportedTypes.includes(fileName[fileName.length - 1].toLowerCase()) === false) {
        setNotSupported(file.name);
        setUploadMedia(false);
        setShowModal(true);
      }
      else {
        setUploadMedia(false);
        let newFileName = file.name;
        newFileName = newFileName.replace(/ /g, '_')
        newFileName = newFileName.replace(/\(|\)/g, '');
        const bucket = uuidv4();
        const config = {
          bucketName: REACT_APP_BUCKET,
          dirName: `${props.user._id}/${bucket}`,
          region: 'us-east-2',
          accessKeyId: REACT_APP_AWS_KEY,
          secretAccessKey: REACT_APP_AWS_SECRET_KEY
        }
        const ReactS3Client = new S3(config);
        setLoading(true);
        props.setLoadingVideo(true);
        ReactS3Client.uploadFile(file, newFileName).then(data => {
          LoadingStatus.pop();
          props.setCarouselLoader(true);
          props.setDisableButtons(true);
          if (data.status === 204) {
            let fileDetails = {
              userid: props.user._id,
              filename: file.name,
              fileurl: data.location
            }
            props.dispatch(createTempProject(data.location, bucket, props.setLoadingVideo)).then((res) => {
              localStorage.setItem("currentProjectId", res.project._id);
              localStorage.setItem('TotalFiles', supportedFiles.length - 1);
              props.setLoadingStatus(LoadingStatus);
              let format = ['mp4', 'mov'];
              let lastFormat = data.key.split('.').pop();
              !format.includes(lastFormat) && props.setLoadingVideo(false)
              if (res.mediaType === mediaTypeVideo) {
                props.setLoadingSlider(true);
                props.dispatch(takeScreenshots(
                  res.project._id,
                  res.project.bucket,
                  res.project.content[0].mediaSrc,
                  res.project.content[0].mediaName
                  , props.setLoadingSlider
                )).then(
                  () => {
                    let index = 1;
                    if (supportedFiles.length > 1) { handleRemaining(supportedFiles, bucket, index) } else {
                      props.setDisableButtons(false);
                      props.setCarouselLoader(false);
                    };
                  }

                )
                setLoading(false);
              }
              else if (res.mediaType !== mediaTypeVideo) {
                let index = 1;
                if (supportedFiles.length > 1) { handleRemaining(supportedFiles, bucket, index) } else {
                  props.setDisableButtons(false);
                  props.setCarouselLoader(false);
                };
              }
            })
          }
          else {
            toast.error('The File was no uploaded to AWS')
          }
        })
      }
    }
    // }
  }

  const handleRemaining = (files, bucket, index) => {
    console.log("file index", index)
    props.setComments([]);
    let remainingFiles = files[index];
    const fileSize = remainingFiles.size / 1048576;
    const fileName = (remainingFiles.name).split('.');
    let supportedTypes = ["wav", "mp3", "aac", "ogg", "oga", "wma", "flac", "png", "gif", "avif", "apng", "jpg", "jpeg", "svg", "webp", "bmp", "ico", "tiff", "mp4", "mov"]
    if (fileSize > 2048) {
      toast.error('The File size should be less than 2GB')
    }
    if (supportedTypes.includes(fileName[fileName.length - 1].toLowerCase()) === false) {
      setNotSupported(remainingFiles.name);
      setUploadMedia(false);
      setShowModal(true);
    }
    else {
      setUploadMedia(false);
      let newFileName = remainingFiles.name;
      newFileName = newFileName.replace(/ /g, '_')
      newFileName = newFileName.replace(/\(|\)/g, '');
      const config = {
        bucketName: REACT_APP_BUCKET,
        dirName: `${props.user._id}/${bucket}`,
        region: 'us-east-2',
        accessKeyId: REACT_APP_AWS_KEY,
        secretAccessKey: REACT_APP_AWS_SECRET_KEY
      }
      const ReactS3Client = new S3(config);
      setLoading(true);
      // props.setLoadingVideo(true);
      ReactS3Client.uploadFile(remainingFiles, newFileName).then(data => {
        if (data.status === 204) {
          props.dispatch(addMediaToProject(data.location, localStorage.currentProjectId, props.project.bucket, props.setLoadingVideo))
            .then((res) => {
              LoadingStatus.pop();
              setLoading(false);
              props.setLoadingStatus(LoadingStatus);
              let currentMedia = res.currentMedia;
              localStorage.currentMedia = res.currentMedia._id;
              // props.setIsShowComment(false);
              // props.setShowShareModal(false);
              props.setComments([]);
              // props.setErrorMessage(null);
              if (res.mediaType === mediaTypeVideo) {
                props.setLoadingSlider(true);
                props.dispatch(takeScreenshots(
                  res.project._id,
                  props.project.bucket,
                  currentMedia.mediaSrc,
                  currentMedia.mediaName
                  , props.setLoadingSlider)).then(() => {
                    index = index + 1;
                    if (index < files.length) {
                      handleRemaining(files, bucket, index)

                    } else {
                      props.setDisableButtons(false);
                      props.setCarouselLoader(false);
                    }
                  })
              }
              else {
                index = index + 1;

                if (index < files.length) { handleRemaining(files, bucket, index) }
                else {
                  props.setDisableButtons(false);
                }

              }
            })
        }
      });
    }
  }

  return (
    <>
      {showDemo && <DemoLayerEmpty setShowDemo={setShowDemo} />}
      {loading ? <div className="spinner__wrapper" style={{ height: '100vh' }}>

        <MoonLoader className="spinner" color="#000" loading={loading} size={50} />
        <div style={{ padding: "20px" }}>Uploading....  Please wait </div>

      </div> :
        <div class='upload_media_allignment'>
          <img src={uploadImage} alt="upload_image" />
          <h3>Upload videos to start!</h3>
          <p className='Upload_media_paragraph'>Select media in the order you want it to be used.</p>
          <div className="upload__media--field" >
            <label htmlFor="upload__media--button" onClick={() => setUploadMedia(true)}>
              Upload Media
            </label>
          </div>
        </div>
      }
      {
        showModal &&
        (<div className=" modal__wrapper">
          <div className="style__modal">
            {/* <div className="connectSocial__cross" onClick={() => { props.setShowPayAccess(true); props.setShowPromoCodeWall(false) }}>
                  <Cancel fill="black" className="connectSocial__cross--cancel" />
                  <ArrowLeft className="connectSocial__cross--arrowLeft" />
              </div> */}
            <h3>File not supported</h3>
            {notSupported}
            <button className="pay__modal--submit" onClick={() => setShowModal(false)}>Ok</button>
          </div>
        </div>)
      }
      {uploadMedia && <div className=" modal__wrapper">
        <div className="style__modal uploadFiles_model">
          <div className="connectSocial__cross" onClick={() => { setUploadMedia(false) }}>
            <Cancel fill="black" />
          </div>
          <Dropzone onDrop={(e) => {
            handleChange(e);
          }}>
            {({ getRootProps, getInputProps }) => ((
              <div {...getRootProps()}>
                <h2 className='dropzone_header'>Upload Media</h2>
                <p className='dropzone_paragraph'>Drag 'n' drop some files here, or click to select files</p>
                <div className='dropzone_css' style={{ display: 'flex', justifyContent: 'center', width: "56vw" }}>
                  <div style={{ width: "10vw" }}>
                    <label htmlFor="mediaFiles__button" className='plus_alignment dropzone_css'>
                      <img src={Plus2} className='dropzone_img'></img>
                    </label>
                  </div>
                  <input {...getInputProps()}
                    multiple='multiple'
                    accept="audio/*,video/*,image/*"
                  />
                </div>
              </div>))}
          </Dropzone>
        </div>
      </div>
      }

    </>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project
})

export default connect(mapStateToProps)(EmptyProject);
