import React, { useRef, useState, useEffect } from 'react';
import { connect } from "react-redux";
import S3 from 'react-aws-s3';
import { v4 as uuidv4 } from 'uuid';
import uploadImage from "../../assets/img/upload_image.png";
import { REACT_APP_AWS_KEY, REACT_APP_AWS_SECRET_KEY, REACT_APP_BUCKET } from "../../utils/misc";
import { createTempProject, takeScreenshots } from "../../store/actions/project.action";
import { toast } from "react-toastify";
import DemoLayerEmpty from "../DemoLayer/DemoLayerEmpty";

const EmptyProject = (props) => {

  const fileInput = useRef();
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (localStorage.showDemoLayer === 'true') {
      setShowDemo(true)
    }
  }, [])

  const handleChange = (e) => {
    props.setComments([])
    const file = e.target.files[0]; // accessing file
    const fileSize = file.size / 1048576;
    if (fileSize > 100) {
      toast.error('The File size should be less than 100MB')
    } else {
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
            if (!res.isImage) {
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
        />
        <label htmlFor="upload__media--button" style={{
          boxShadow: showDemo && "0px 0px 25px 0px #306D76",
          zIndex: showDemo && 102
        }}>
          Upload Media
        </label>
      </div>
      <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
        incididunt ut labore et dolore magna aliqua.</span>
    </>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project
})

export default connect(mapStateToProps)(EmptyProject);
