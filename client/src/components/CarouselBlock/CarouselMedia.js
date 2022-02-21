import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from "react-router-dom";
import Carousel from "nuka-carousel";
import { connect } from "react-redux";
import S3 from 'react-aws-s3';
import { arrayMoveImmutable } from 'array-move';
import { REACT_APP_AWS_KEY, REACT_APP_AWS_SECRET_KEY, REACT_APP_BUCKET } from "../../utils/misc";
import './CarouselMedia.scss';
import Plus2 from "../../assets/img/button.png";
import {
  addMediaToProject,
  takeScreenshots,
  updateContent,
  deleteVideo,
  clearTempProject
} from "../../store/actions/project.action";
import { toast } from "react-toastify";
import DraggableContentList from "../DraggableContent/DraggableContentList";
import { mediaTypeVideo } from '../../utils/constant';
import Dropzone from 'react-dropzone';
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import MoonLoader from "react-spinners/MoonLoader";
import { FaDownload } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const CarouselMedia = (props) => {

  const history = useHistory();
  const fileInput = useRef();
  const sliderItemWidth = useRef(null);
  const [contents, setContents] = useState([{}]);
  const [showDraggable, setShowDraggable] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploadMedia, setUploadMedia] = useState(false);
  const [notSupported, setNotSupported] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {

    setContents(props.content);


  }, [props.content, props.loadingStatus])
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
    props.setComments([])
    LoadingStatus.length && props.setLoadingStatus(LoadingStatus);
    setUploadMedia(false);
    const bucket = uuidv4();
    setLoading(true);
    props.setLoadingVideo(true);

    supportedFiles.length && handleRemaining(supportedFiles, bucket, 0)



  }
  const handleRemaining = (files, bucket, index) => {
    props.setCarouselLoader(true);
    props.setDisableButtons(true);
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
      props.setLoadingVideo(true);
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

                if (index < files.length) {
                  handleRemaining(files, bucket, index)

                } else {
                  props.setDisableButtons(false);
                  props.setCarouselLoader(false);
                }

              }
            })
        }
      });

    }
    // }
  }


  const onSortEnd = ({ oldIndex, newIndex }) => {
    setContents(arrayMoveImmutable(contents, oldIndex, newIndex));
    let newContent = arrayMoveImmutable(contents, oldIndex, newIndex)
    props.dispatch(updateContent(newContent));
  };
  // this function is no longer required because we are updating comment in mongoDB on press "Enter" while adding comments.
  const updateComments = (id) => {
    let newCurrentMedia = { ...props.currentMedia };
    let newContent = [...props.project.content];
    let index = contents.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if (localStorage.comments && newCurrentMedia.screens.length) {
      let newComments = JSON.parse(localStorage.comments);
      // newCurrentMedia = newCurrentMedia.screens.map((item, i) => {
      //   return newComments[i].text.length > 0 ? { ...item, comment: newComments[i] } : item
      // })
      newContent[index].comments = newComments;
      props.setComments([]);
    }
    props.dispatch(updateContent(newContent));
  }

  const deleteVideoHandle = (e, id) => {
    e.stopPropagation();
    let newContent = props.project.content.filter(con => con._id !== id);
    let deletedVideo = props.project.content.filter(con => con._id === id);
    setContents(newContent);
    if (props.project.content.length === 1) {
      props.dispatch(deleteVideo(newContent, deletedVideo[0], props.project.bucket)).then(() => {
        props.dispatch(clearTempProject(props.project._id, props.project.bucket))
        history.push('/dashboard/upload');
      });
    } else {
      props.dispatch(deleteVideo(newContent, deletedVideo[0], props.project.bucket))
    }

  }

  return (
    <div className="mediaFiles__slider" onDoubleClick={(e) => {
      e.stopPropagation();
      setShowDraggable(!showDraggable);
      setShowArrow(false);
    }}
    >
      {!showDraggable ? <Carousel slidesToShow={window.innerWidth <= 575 ? 3 : 5}
        heightMode="first"
        defaultControlsConfig={{
          nextButtonText: '>',
          prevButtonText: '<',
          pagingDotsStyle: {
            display: "none"
          }
        }}
        dragging={true}
      >
        {contents.map(media => (

          <div className="mediaFiles__slider--inner" key={media._id}
            style={{
              border: localStorage.currentMedia === media._id ? `8px solid hsl(229deg 82% 11%)` : props.editedProject._id === media._id && `8px solid #4ea0d6`,
              background: (media.isImage || (media.screens && media.screens.length > 0))
                ? `url(${media.isImage ? media.mediaSrc : media.screens[1].screenSrc})` : 'black'
            }}
            onClick={async () => {
              if (props.project?.projectStatus === "Draft") {
                if (localStorage.updateComment && localStorage.updateComment === 'true') {
                  await updateComments(localStorage.currentMedia);
                }
                if (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true') {
                  await updateComments(localStorage.currentMedia)
                }
              }

              localStorage.currentMedia = media._id;
              props.setIsShowComment(false)
              props.setShowShareModal(false);
              props.setComments([]);
              props.setErrorMessage(null);
              props.setMedia();
            }
            }
          >
            {props.editedProject._id === media._id && <span className='vertical_line'></span>}
            {(media.mediaType === "Video" && (media.screens && media.screens.length) > 0) || media.mediaType !== "Video" ? <p> media.mediaName </p> : <div style={{ position: 'relative', color: "white", display: 'flex', justifyContent: 'center', width: '50%' }}><MoonLoader className="spinner" color=" #ffffff" loading={true} size={50} />
              <div style={{ position: 'absolute', top: '35%', right: '25%' }}>50%</div></div>}
            {/* {(media.mediaType === "Video" && (media.screens && media.screens.length) <= 0) && <div style={{ display: 'flex', justifyContent: 'center', width: '100vw' }}>
                <MoonLoader className="spinner" color=" #ffffff" loading={props.carouselLoader} size={50} />
              </div>} */}
            {/* <p>{!media.mediaType === "Video" ? media.mediaName : ""}</p> */}
            {props.isEditor && <a href={`${media.mediaSrc}`} target="_blank" rel="noreferrer" download={`${media.mediaSrc}`} title='Download'> <span className="download__video--btn">
              <FaDownload size={"30px"} />
            </span></a>}
            {props.project.projectStatus === "Draft" && <span className="delete__video--btn" onClick={(e) =>
              deleteVideoHandle(e, media._id)}>X</span>}
          </div>

        ))}
        {props.loadingStatus && props.loadingStatus?.length > 0 && props.loadingStatus?.map((e, key) => (<div key={key} className="mediaFiles__slider--inner" style={{ backgroundColor: 'black' }}>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100vw' }}>
            <MoonLoader className="spinner" color=" #ffffff" loading={props.carouselLoader} size={50} />
          </div>
        </div>))}
        {(props.project.projectStatus === "Draft" || (props.isEditor && props.project.projectStatus !== "Done")) && <div className="mediaFiles__slider--inner" ref={sliderItemWidth}
          onClick={() => {
            props.disableButtons === false && setUploadMedia(true)
            if ((localStorage.updateComment && localStorage.updateComment === 'true')
              || (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true')) {
              updateComments(localStorage.currentMedia);

            }
          }
          }
        >
          <div>
            <img src={Plus2} alt="input" className='corousel_img' />
          </div>
          <span className="tip_icon" style={{ marginTop: "6px", marginRight: "5px" }}>
            i
            <span className="info" style={{ marginTop: "10px", marginLeft: "-100px" }}>
              Add more media files to your project.
            </span>
          </span>
        </div>}
      </Carousel>
        :
        <DraggableContentList
          contents={contents}
          axis="x"
          distance={15}
          onSortEnd={onSortEnd}
          setMedia={props.setMedia}
          itemWidth={sliderItemWidth.current && sliderItemWidth.current.clientWidth}
        />}
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
            <button className="pay__modal--submit" type="submit" onClick={() => { setShowModal(false) }}>Ok</button>
          </div>
        </div>)
      }
      {
        uploadMedia && <div className=" modal__wrapper"><div className="style__modal uploadFiles_model">
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
                <div className='dropzone_css' style={{ display: 'flex', justifyContent: 'center', width: "57vw" }}>
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
    </div >
  );
}

const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project,
  loading: state.project.loading
})

export default connect(mapStateToProps)(CarouselMedia);
