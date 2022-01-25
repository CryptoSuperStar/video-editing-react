import React, { useRef, useState, useEffect } from 'react';
import { connect } from "react-redux";
import S3 from 'react-aws-s3';
import { v4 as uuidv4 } from 'uuid';
import uploadImage from "../../assets/img/upload_image.png";
import { REACT_APP_AWS_KEY, REACT_APP_AWS_SECRET_KEY, REACT_APP_BUCKET } from "../../utils/misc";
import { createTempProject, takeScreenshots } from "../../store/actions/project.action";
import { toast } from "react-toastify";
import DemoLayerEmpty from "../DemoLayer/DemoLayerEmpty";
import { mediaTypeVideo } from '../../utils/constant';

const EmptyProject = (props) => {

  const fileInput = useRef();
  const [showDemo, setShowDemo] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (localStorage.showDemoLayer === 'true') {
      setShowDemo(true)
    }
  }, [])

  const handleChange = (e) => {
    const { target } = e;
    props.setComments([])
    const file = e.target.files[0]; // accessing file
    const fileSize = file.size / 1048576;
    const fileName = (file.name).split('.');
    let supportedTypes = ["wav","mp3","aac","ogg","oga","wma","flac","png","gif","avif","apng","jpg", "jpeg","svg","webp","bmp","ico","tiff","mp4"]
    if (fileSize > 2048) {
      toast.error('The File size should be less than 2GB')
      target.files = null;
      target.value = null;
    }
    if(supportedTypes.includes(fileName[fileName.length - 1].toLowerCase()) === false ){
      setShowModal(true);
      target.files = null;
      target.value = null;
    }
    else {
      let newFileName = e.target.files[0].name;
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
      props.setLoadingVideo(true);
      ReactS3Client.uploadFile(file, newFileName).then(data => {
        if (data.status === 204) {
          props.dispatch(createTempProject(data.location, bucket, props.setLoadingVideo)).then((res) => {
            if (res.mediaType === mediaTypeVideo) {
              props.setLoadingSlider(true);
              props.dispatch(takeScreenshots(
                res.project._id,
                res.project.bucket,
                res.project.content[0].mediaSrc,
                res.project.content[0].mediaName
                , props.setLoadingSlider))
            }
          })
        } else {
          toast.error('The File was no uploaded to AWS')
        }
      })
    }
  }

  return (
    <>
      {showDemo && <DemoLayerEmpty setShowDemo={setShowDemo} />}
      <img src={uploadImage} alt="upload_image" />
      <h3>Upload videos to start!</h3>
      <p>Select media in the order you want it to be used.</p>
      <div className="upload__media--field" >
        <input type="file" ref={fileInput} id="upload__media--button"
          onChange={handleChange}
          accept="audio/*,video/*,image/*"
        />
        <label htmlFor="upload__media--button">
          Upload Media
        </label>
      </div>
      <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.</span>
      {
        showModal &&
        (<div className=" modal__wrapper">
          <div className="style__modal">
            {/* <div className="connectSocial__cross" onClick={() => { props.setShowPayAccess(true); props.setShowPromoCodeWall(false) }}>
                  <Cancel fill="black" className="connectSocial__cross--cancel" />
                  <ArrowLeft className="connectSocial__cross--arrowLeft" />
              </div> */}
            <h3>File not supported</h3>
              <button className="pay__modal--submit" onClick={()=>setShowModal(false)}>Ok</button>
          </div>
        </div>)
      }
    </>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project
})

export default connect(mapStateToProps)(EmptyProject);
