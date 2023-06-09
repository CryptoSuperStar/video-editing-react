import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import MoonLoader from "react-spinners/MoonLoader";
import ClockLoader from "react-spinners/PuffLoader";
import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import "./UploadMedia.scss";
import StyleInspirationModal from "../Modals/StyleInspirationModal";
import cam from "../../assets/img/icon-awesome-video-1@1x.png";
import { ReactComponent as Delete } from "../../assets/img/delete.svg";
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import { ReactComponent as Chat } from "../../assets/img/chat.svg";
import { ReactComponent as Share } from "../../assets/img/share.svg";
import { clearTempProject, takeScreenshots, updateContent, getProject } from "../../store/actions/project.action";
import CommentBlock from "../CommentBlock/CommentBlock";
import ShareModal from "../Modals/ShareModal";
import EmptyProject from "../EmptyProject/EmptyProject";
import TimeLine from "../TimeLine/TimeLine";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import CarouselMedia from "../CarouselBlock/CarouselMedia";
import { ReactComponent as Trim } from "../../assets/img/trim.svg";
import { createProjectMedia } from '../../store/actions/project.action';
import { useHistory } from "react-router-dom";
import { mediaTypeVideo } from "../../utils/constant";
momentDurationFormatSetup(moment);

const UploadMedia = props => {
  const [currentMedia, setCurrentMedia] = useState({
    mediaName: "",
    mediaSrc: "",
    duration: 0,
    startTime: 0,
    endTime: 0,
    screens: [],
    revision: 0
  });
  const history = useHistory();
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showTrimBox, setShowTrimBox] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState([]);
  const [projectContent, setProjectContent] = useState([]);
  const [activeComment, setActiveComment] = useState('');
  const [imageCommentDate, setImageCommentDate] = useState("");
  const [editCommentValue, setEditCommentValue] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShowComment, setIsShowComment] = useState(false);
  const [showCommentBlock, setShowCommentBlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [loadingSlider, setLoadingSlider] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [videoPlayerLoader, setVideoPlayerLoader] = useState(false);
  const [disableButtons, setDisableButtons] = useState(false);
  const [carouselLoader, setCarouselLoader] = useState(false);
  const editableStatus = ["Draft", "Complete"]
  const [loadingStatus, setLoadingStatus] = useState([]);
  const editedProject = props.project?.editedProjects?.length > 0 ? props.project?.editedProjects.find(item => item.revision === props.project.projectRevision) : false
  let commentFinal = [];
  const [isEditor, setIsEditor] = useState(false)

  useEffect(() => {
    if (props.user.userRole === "editor") {
      setIsEditor(true)
    }
  }, [props.user.userRole])
  useEffect(
    () => {
      if (localStorage.currentProjectId) {
        setLoading(true);
        props.dispatch(getProject(localStorage.currentProjectId, setLoading));
      } else {
        localStorage.removeItem("duration");
        localStorage.removeItem("currentProjectId");
        localStorage.removeItem("currentMedia");
        localStorage.removeItem("comments");
        localStorage.removeItem("imageComments");
      }
    },
    [localStorage.currentProjectId]
  );
  useEffect(() => {
    if (props.project.projectName) {
      const editedProject = props.project.editedProjects.length > 0 ? props.project.editedProjects.find(item => item.revision === props.project.projectRevision) : false
      if (isEditor && props.project.tempEditedMedia?.mediaSrc) {
        if (editedProject) {
          setProjectContent([...props.project.content, editedProject, props.project.tempEditedMedia]);
        }
        else {
          setProjectContent([...props.project.content, props.project.tempEditedMedia])
        }
      } else if (editedProject) {
        setProjectContent([...props.project.content, editedProject]);
      } else {
        setProjectContent(props.project.content);
      }
    }
  }, [isEditor, props.project.content, props.project.editedProjects, props.project.projectName, props.project.projectRevision, props.project.tempEditedMedia])
  useEffect(
    () => {
      if (localStorage.currentMedia && props.project.projectName && props.project.content.length > 0) {
        setMedia();
      }
    },
    [localStorage.currentMedia, props.project.content, projectContent, props.project.projectName]
  );

  useEffect(() => {
    setActiveComment('')
    if (currentMedia.isImage && ["Draft", "In Progress"].includes(props.project?.projectStatus)) {
      setActiveComment(currentMedia.comment || '');
    }
  }, [currentMedia])
  useEffect(() => {
    if (!isEditor && !editedProject?.screens?.length > 0 && editedProject.mediaType === mediaTypeVideo) {
      setLoadingSlider(true);
      props.dispatch(takeScreenshots(
        props.project._id,
        props.project.bucket,
        editedProject.mediaSrc,
        editedProject?.mediaName
        , setLoadingSlider))
    }
  }, [editedProject?.mediaName, editedProject?.mediaSrc, editedProject?.mediaType, editedProject?.screens?.length, isEditor])
  const setMedia = () => {



    let curMedia = projectContent.filter(item => item._id === localStorage.currentMedia)[0];

    if (!curMedia) {
      curMedia = editedProject ? editedProject : props.project?.content[0];
    }
    if (curMedia.screens.length > 0) {
      curMedia.screens.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    }
    setCurrentMedia(curMedia);
    if (curMedia.comments && ((!(["Complete", "Done"].includes(props.project?.projectStatus)) && props.user.userRole === "customer" && curMedia.revision === props.project.projectRevision) || props.user.userRole === "editor")) {
      localStorage.comments = JSON.stringify(curMedia?.comments);
      setComments(curMedia?.comments);
    }
    // if (curMedia.comments && props.user.userRole === "editor") {
    //   localStorage.comments = JSON.stringify(curMedia?.comments);
    //   setComments(curMedia?.comments);
    // }

    if (localStorage.editedVideoComments && curMedia._id === editedProject._id) {
      let editedVideoComments = JSON.parse(localStorage?.editedVideoComments);
      setComments(editedVideoComments);
      localStorage.comments = JSON.stringify(editedVideoComments);

    }
    setActiveComment('')
    if (curMedia.isImage && ["Draft", "In Progress"].includes(props.project?.projectStatus)) {
      setActiveComment(curMedia.comment || '');
      setImageCommentDate(currentMedia.createdAt || '');
    }
  }
  const handleClear = () => {
    setComments([]);
    setCurrentMedia({ mediaName: '', mediaSrc: '', screens: [], duration: 0, endTime: 0, startTime: 0 });
    props.dispatch(clearTempProject(props.project._id, props.project.bucket));
  }

  const handleTrimVideo = () => {
    localStorage.showTrimBox = !showTrimBox;
    setShowTrimBox(!showTrimBox);
  }

  const handleActiveScreenshot = (idx) => {
    setIsShowComment(!isShowComment);
    localStorage.isShowComment = !isShowComment;
    // setActiveComment(comments[idx] && comments[idx].text)
  }
  const editComment = (idx) => {
    setIsShowComment(true);
    setActiveIndex(idx);
    setActiveComment(comments[idx] && comments[idx]?.text)
    setEditCommentValue(true);

  }
  const handleCommentChange = (e) => {
    setActiveComment(e.target.value);
  };

  const updateComments = (id) => {
    let newCurrentMedia = { ...currentMedia };
    let newContent = [...props.project.content];
    let index = projectContent.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if (localStorage.comments) {
      let newComments = JSON.parse(localStorage.comments);
      // newCurrentMedia = newCurrentMedia.screens.map((item, i) => {
      //   return newComments[i].text.length > 0 ? { ...item, comment: newComments[i] } : item
      // })
      newContent[index].comments = newComments;
    }
    props.dispatch(updateContent(newContent));
  }
  const handleCommentEnter = e => {
    setIsShowComment(false);
    let newCommentsArray = [...comments];

    let comment = {
      text: activeComment,
      createdAt: new Date(),
      rawTime: currentTime,
      time: moment.duration(currentTime, 'seconds').format("mm:ss:SSS", { trim: false })
    }
    if (editCommentValue) {
      newCommentsArray[activeIndex].text = comment.text;
      setEditCommentValue(false)
    } else {
      newCommentsArray.push(comment);
    }
    commentFinal = newCommentsArray.sort((a, b) => a.rawTime - b.rawTime);
    setComments(commentFinal);
    localStorage.comments = JSON.stringify(newCommentsArray);
    localStorage.updateComment = true;
    if (props.project.projectStatus === "Draft") {
      updateComments(currentMedia._id);
    } else if ((editedProject ? editedProject?._id === currentMedia._id : false)) {
      localStorage.editedVideoComments = JSON.stringify(newCommentsArray);
    }
    setActiveComment("");
  };
  const handleImageComment = (event) => {
    localStorage.imageComments = event.target.value;
    setActiveComment(event.target.value)
  }
  const updateImageComments = (id) => {
    let newCurrentMedia = { ...currentMedia };
    let newContent = [...projectContent];
    let index = projectContent.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if (localStorage.imageComments) {
      let newComments = localStorage.imageComments;
      newContent[index].comment = newComments;
      newContent[index].createdAt = new Date();
    }
    props.dispatch(updateContent(newContent));
    return newContent;
  }
  const toggleCommentBlock = () => setShowCommentBlock(!showCommentBlock);
  const toggleShareBlock = () => setShowShareModal(!showShareModal);
  // if (!currentMedia.isImage) {
  //   comments && comments.length > 0 && comments.map((item, index) => item.map((innerItem, i) => commentFinal.push(innerItem)));
  //   commentFinal = commentFinal
  //     ? commentFinal.sort((a, b) => moment.duration(a.time).asSeconds() - moment.duration(b.time).asSeconds())
  //     : [];
  // } else {
  //   commentFinal.push({ createdAt: imageCommentDate || new Date(), text: activeComment, time: "" });
  // }
  return (
    <div className="upload__media">
      {showStyleModal && (
        <StyleInspirationModal
          isImage={currentMedia.isImage}
          setShowStyleModal={setShowStyleModal}
          user={props.user}
          project={props.project}
          setLoading={setLoading}
          comments={comments}
          currentMedia={currentMedia}
          content={projectContent}
          setComments={setComments}
        />
      )}
      {showWarningModal &&
        <div className="modal__wrapper" style={{ zIndex: localStorage.showDemoLayer === 'true' && '130' }}>
          <div className="style__modal">
            <div className="connectSocial__cross" onClick={() => setShowWarningModal(false)}>
              <Cancel fill="black" />
            </div>
            <div className='warning-container'>
              <div className='massage'> You are about to submit your project. Make sure all changes are done and you have uploaded media . Are you sure?</div>
              <div className="option">
                <button className='pay__modal--submit' onClick={() => setShowWarningModal(false)}> No</button>
                <button className='pay__modal--submit' onClick={() => props.dispatch(createProjectMedia(props.project, history, setShowWarningModal, props.user.userRole))}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      }
      <div className="upload__media--inner">
        {currentMedia.mediaName && props.project.projectName ? (
          <div className="video__block" style={{ marginTop: window.innerWidth <= 575 && showCommentBlock && "0" }}>
            {!videoPlayerLoader && <div className="video__indicators">
              <div className="comments_indicator" onClick={toggleCommentBlock}>
                <Chat />
                <span className="comments__total">
                  {comments && comments.length && comments.filter(comment => comment.text.length > 0).length}
                </span>
              </div>
              <div className="share_indicator" onClick={(e) => {
                if (["Complete", "Done"].includes(props.project?.projectStatus) && editedProject._id === currentMedia?._id) { setShowCommentBlock(false); toggleShareBlock(e) }
              }}>
                <Share />
              </div>
            </div>}
            {videoPlayerLoader ? <div className="spinner__wrapper">

              <MoonLoader className="spinner" color="#000" loading={loading} size={50} />
              <div style={{ padding: "20px" }}>Uploading....  Please wait </div>

            </div> :
              <VideoPlayer
                currentMedia={currentMedia}
                setCurrentMedia={setCurrentMedia}
                moveTo={moveTo}
                setMedia={setMedia}
                content={projectContent}
                setCurrentTime={setCurrentTime}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                setComments={setComments}
                loadingVideo={loading}
              />
            }
            {
              showShareModal && currentMedia.screens.length > 0 && (
                <ShareModal
                  path={currentMedia.mediaSrc}
                  name={currentMedia.mediaName}
                  thumbnail={currentMedia.screens[0].screenSrc}
                  shareBlock = {toggleShareBlock}
                />
              )
            }
            {
              loadingSlider && (
                <div className="spinner__wrapper--slider">
                  <h3>Generate Timeline Bar</h3>
                  <ClockLoader className="spinner" color="#696871" loading={setLoadingSlider} size={25} />
                </div>
              )
            }
            {/* {currentMedia.isImage && <div className="TimeLine" />} */}
            {
              !loadingSlider && !currentMedia.isImage && !videoPlayerLoader && (
                <TimeLine
                  isEditor={isEditor}
                  user={props.user}
                  currentMedia={currentMedia}
                  setCurrentMedia={setCurrentMedia}
                  showTrimBox={showTrimBox}
                  projectStatus={props.project?.projectStatus}
                  setMoveTo={setMoveTo}
                  currentTime={currentTime}
                  isShowComment={isShowComment}
                  activeComment={activeComment}
                  handleCommentChange={handleCommentChange}
                  handleCommentEnter={handleCommentEnter}
                  comments={comments}
                  activeIndex={activeIndex}
                  setIsShowComment={setIsShowComment}
                  setActiveComment={setActiveComment}
                  setActiveIndex={setActiveIndex}
                  editComment={editComment}
                  setCurrentTime={setCurrentTime}
                  editCommentValue={editCommentValue}
                  setEditCommentValue={setEditCommentValue}
                />
              )
            }
            {
              currentMedia.isImage ? (
                <div className="image__coment">
                  <textarea placeholder="Add edit notes here:" rows="5"
                    value={activeComment}
                    onChange={(e) => { props.project?.projectStatus === "Draft" && handleImageComment(e) }}
                    onKeyDown={(e) => {
                      if (!e.shiftKey && e.key === 'Enter') {
                        updateImageComments(currentMedia._id)
                      }
                    }} />{" "}
                </div>
              ) : (
                ""
              )
            }
            <div className="generate__btns">
              {isEditor ? <>
                <button
                  style={{ backgroundColor: "hsl(229deg 82% 11%)" }}
                  disabled={loading ? true : false}
                >
                  <span>Revision {props.project?.projectRevision}</span>
                </button>
                <button
                  disabled={loading ? true : false}
                  style={{ backgroundColor: ((["Done", "Complete"]).includes(props.project?.projectStatus)) && "gray", textAlign: "center" }}
                  onClick={(e) => { (!(["Done", "Complete"]).includes(props.project?.projectStatus)) && setShowWarningModal(true) }}
                >
                  <span>Submit</span>
                </button>
              </> : <>
                <button
                  disabled={loading ? true : false}
                  onClick={(e) => { (editableStatus.includes(props.project?.projectStatus) && (editedProject ? editedProject._id === currentMedia._id : true)) && handleActiveScreenshot(e) }}
                  style={{ backgroundColor: (isShowComment || !(editableStatus.includes(props.project?.projectStatus)) || (editedProject ? editedProject._id !== currentMedia._id : false)) && "gray" }}>
                  <Chat />
                  <span>Add Edit Notes</span>
                  <span className="tip_icon">
                    i
                    <span className="info">
                      Add your edit notes on the Time Line Bar,
                      where you wish the item to appear.
                    </span>
                  </span>
                </button>
                <button
                  disabled={loading ? true : false}
                  onClick={(e) => { (props.project?.projectStatus === "Draft") && handleTrimVideo(e) }}
                  style={{ backgroundColor: (showTrimBox || !(props.project?.projectStatus === "Draft")) && "gray" }}>
                  <Trim />
                  <span>Trim</span>
                </button>
                <button className="generate-video"
                  disabled={disableButtons ? true : false}
                  onClick={() => { (editableStatus.includes(props.project?.projectStatus) && (editedProject ? editedProject._id === currentMedia._id : true)) && setShowStyleModal(true) }}
                  style={{ backgroundColor: (!(editableStatus.includes(props.project?.projectStatus)) || (editedProject ? editedProject._id !== currentMedia._id : false)) && "gray" }}>
                  <img src={cam} alt="cam" />
                  <span>Generate Video</span>
                  <span className="tip_icon">
                    i
                    <span className="info" style={{ marginLeft: "-275px", marginBbottom: "70px" }}>
                      This will send your project for editing.
                      You will not be able to perform further edits to your project
                      once you submit and your project is being processed.
                    </span>
                  </span>
                </button>

              </>}
            </div >

            {
              props.project.content && projectContent.length > 0 && (
                <CarouselMedia
                  isEditor={isEditor}
                  setIsShowComment={setIsShowComment}
                  content={projectContent}
                  projectStatus={props.project?.projectStatus}
                  setComments={setComments}
                  setLoadingVideo={setLoading}
                  loadingVideo={loading}
                  setLoadingSlider={setLoadingSlider}
                  user={props.user}
                  setMedia={setMedia}
                  setShowShareModal={setShowShareModal}
                  currentMedia={currentMedia}
                  editedProject={editedProject}
                  setCurrentTime={setCurrentTime}
                  setErrorMessage={setErrorMessage}
                  projectName={props.project.projectName}
                  disableButtons={disableButtons}
                  loadingStatus={loadingStatus}
                  setLoadingStatus={setLoadingStatus}
                  setCarouselLoader={setCarouselLoader}
                  carouselLoader={carouselLoader}
                  setDisableButtons={setDisableButtons}
                />
              )
            }
          </div >
        ) : (
          <EmptyProject setDisableButtons={setDisableButtons} setVideoPlayerLoader={setVideoPlayerLoader} setComments={setComments} setLoadingVideo={setLoading} setLoadingSlider={setLoadingSlider} loadingStatus={loadingStatus} setLoadingStatus={setLoadingStatus} setCarouselLoader={setCarouselLoader} carouselLoader={carouselLoader} />
        )}
      </div >
      {showCommentBlock && <CommentBlock arrComments={comments} />}
    </div >
  );
};
const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project,
  loading: state.project.loading
});

export default connect(mapStateToProps)(UploadMedia);
