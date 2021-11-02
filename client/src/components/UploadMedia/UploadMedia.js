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
import { ReactComponent as Chat } from "../../assets/img/chat.svg";
import { ReactComponent as Share } from "../../assets/img/share.svg";
import { ReactComponent as Info } from "../../assets/img/information.svg";
import { clearTempProject, getProject } from "../../store/actions/project.action";
import CommentBlock from "../CommentBlock/CommentBlock";
import ShareModal from "../Modals/ShareModal";
import EmptyProject from "../EmptyProject/EmptyProject";
import TimeLine from "../TimeLine/TimeLine";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import CarouselMedia from "../CarouselBlock/CarouselMedia";
import { ReactComponent as Cut } from "../../assets/img/cut.svg";
import DemoLayerUpload from "../DemoLayer/DemoLayerUpload";

momentDurationFormatSetup(moment);

const UploadMedia = props => {
  const [currentMedia, setCurrentMedia] = useState({
    mediaName: "",
    mediaSrc: "",
    duration: 0,
    startTime: 0,
    endTime: 0,
    screens: []
  });
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showCutBox, setShowCutBox] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState('');
  const [imageCommentDate, setImageCommentDate] = useState("");
  const [editCommentValue, setEditCommentValue] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShowComment, setIsShowComment] = useState(false);
  const [showCommentBlock, setShowCommentBlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingSlider, setLoadingSlider] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  let commentFinal = [];
  useEffect(() => {
    if (localStorage.showDemoLayer === "true") {
      setShowDemo(true);
    }
  }, []);

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

  useEffect(
    () => {
      if (localStorage.currentMedia && props.project.projectName && props.project.content.length > 0) {
        setMedia();
      }
    },
    [localStorage.currentMedia, props.project.content]
  );

  useEffect(() => {
    setActiveComment('')
    if (currentMedia.isImage) {
      setActiveComment(currentMedia.comment || '');
    }
  }, [currentMedia])
  const setMedia = () => {
    let curMedia = props.project.content.filter(item => item._id === localStorage.currentMedia)[0];
    if (!curMedia) {
      curMedia = props.project.content[0];
    }
    if (curMedia.screens.length > 0) {
      curMedia.screens.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    }
    setCurrentMedia(curMedia);
    console.log(curMedia,'curMedia');
    if (curMedia.mediaName && curMedia.screens.length > 0) {
      let commentsArray = curMedia.screens.map(item => item.comment);
      localStorage.comments = JSON.stringify(commentsArray);
      setComments(commentsArray);
    }
    setActiveComment('')
    if(curMedia.isImage){
      setActiveComment(curMedia.comment || '');
      setImageCommentDate(currentMedia.createdAt || '');
    }
  }
  const handleClear = () => {
    setComments([]);
    setCurrentMedia({ mediaName: '', mediaSrc: '', screens: [], duration: 0, endTime: 0, startTime: 0 });
    props.dispatch(clearTempProject(props.project._id, props.project.bucket));
  }

  const handleCutVideo = () => {
    localStorage.showCutBox = !showCutBox;
    setShowCutBox(!showCutBox);
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

  const handleCommentEnter = e => {
    setIsShowComment(false);
    let newCommentsArray = [...comments];
    let newActiveIndex = newCommentsArray[activeIndex].findIndex(
      com => com.time === moment.duration(currentTime, "seconds").format("hh:mm:ss", { trim: false })
    );
    let comment = {
      text: activeComment,
      createdAt: new Date(),
      time: moment.duration(currentTime, "seconds").format("hh:mm:ss", { trim: false })
    };
    if (newActiveIndex !== -1) {
      newCommentsArray[activeIndex][newActiveIndex] = comment;
    } else {
      newCommentsArray[activeIndex].push(comment);
    }
    let newScreens = currentMedia.screens.map((scr, i) => {
      return i === activeIndex ? { ...scr, comment: newCommentsArray[activeIndex] } : scr;
    });
    setCurrentMedia({ ...currentMedia, screens: newScreens });
    setComments(newCommentsArray);
    localStorage.comments = JSON.stringify(newCommentsArray);
    localStorage.updateComment = true;
    setActiveComment("");
  };
  // const handleCommentEnter = e => {
  //   setIsShowComment(false);
  //   let newCommentsArray = [...comments];

  //   let comment = {
  //     text: activeComment,
  //     createdAt: new Date(),
  //     rawTime: currentTime,
  //     time: moment.duration(currentTime, 'seconds').format("hh:mm:ss", { trim: false })
  //   }
  //   if (editCommentValue) {
  //     newCommentsArray[activeIndex].text = comment.text;
  //     setEditCommentValue(false)
  //   } else {
  //     newCommentsArray.push(comment);
  //   }
  //   commentFinal = newCommentsArray.sort((a, b) => a.rawTime - b.rawTime);
  //   setComments(commentFinal);
  //   localStorage.comments = JSON.stringify(newCommentsArray);
  //   localStorage.updateComment = true;
  //   setActiveComment("");
  // };
  const handleImageComment = (event) => {
    localStorage.imageComments = event.target.value;
    setActiveComment(event.target.value)
  }

  const toggleCommentBlock = () => setShowCommentBlock(!showCommentBlock);
  const toggleShareBlock = () => setShowShareModal(!showShareModal);
  if(!currentMedia.isImage){
    comments && comments.length > 0 && comments.map((item, index) => item.map((innerItem, i) => commentFinal.push(innerItem)));
    commentFinal = commentFinal
      ? commentFinal.sort((a, b) => moment.duration(a.time).asSeconds() - moment.duration(b.time).asSeconds())
      : [];
  }else{
    commentFinal.push({createdAt: imageCommentDate || new Date(), text: activeComment, time: ""});
  }
  
  if (loading)
    return (
      <div className="spinner__wrapper">
        <MoonLoader className="spinner" color="#000" loading={loading} size={50} />
      </div>
    );
  return (
    <div className="upload__media">
      {showDemo && localStorage.currentProjectId && <DemoLayerUpload setShowDemo={setShowDemo} />}
      {showStyleModal && (
        <StyleInspirationModal
          isImage={currentMedia.isImage}
          setShowStyleModal={setShowStyleModal}
          user={props.user}
          project={props.project}
          setLoading={setLoading}
          comments={comments}
          currentMedia={currentMedia}
          content={props.project.content}
          setComments={setComments}
        />
      )}
      <div className="upload__media--inner">
        {currentMedia.mediaName && props.project.projectName ? (
          <div className="video__block" style={{ marginTop: window.innerWidth <= 575 && showCommentBlock && "0" }}>
            <div className="video__indicators">
              <div className="comments_indicator" onClick={toggleCommentBlock}>
                <Chat />
                <span className="comments__total">
                {commentFinal && commentFinal.length && commentFinal.filter(comment => comment.text.length > 0).length}
                </span>
              </div>
              <div className="share_indicator" onClick={toggleShareBlock} style={{opacity: showDemo && '20%'}}>
                <Share />
              </div>
              <div className="question_indicator" style={{opacity: showDemo && '20%'}}>
                <Info />
              </div>
            </div>
            <VideoPlayer
              currentMedia={currentMedia}
              setCurrentMedia={setCurrentMedia}
              moveTo={moveTo}
              setMedia={setMedia}
              content={props.project.content}
              setCurrentTime={setCurrentTime}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              setComments={setComments}
            />
            {
              showShareModal && currentMedia.screens.length > 0 && (
                <ShareModal
                  path={currentMedia.mediaSrc}
                  name={currentMedia.mediaName}
                  thumbnail={currentMedia.screens[0].screenSrc}
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
              !loadingSlider && currentMedia.screens.length > 0 && !currentMedia.isImage && (
                <TimeLine
                  currentMedia={currentMedia}
                  setCurrentMedia={setCurrentMedia}
                  showCutBox={showCutBox}
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
                  <textarea placeholder="Add edit notes here:" rows="5" value={activeComment} onChange={handleImageComment} />{" "}
                </div>
              ) : (
                ""
              )
            }
            <div className="generate__btns">
              <button onClick={handleCutVideo} style={{ backgroundColor: showCutBox && "gray" }}>
                <Cut />
                <span>Cut</span>
              </button>
              <button onClick={handleClear}>
                <Delete />
                <span>Clear</span>
              </button>
              <button onClick={() => setShowStyleModal(true)}>
                <img src={cam} alt="cam" />
                <span>Generate Video</span>
              </button>

              <button onClick={handleActiveScreenshot} style={{ backgroundColor: isShowComment && "gray" }}>
                <Chat />
                <span>Comment</span>
              </button>
            </div>

            {
              props.project.content && props.project.content.length > 0 && (
                <CarouselMedia
                  content={props.project.content}
                  setComments={setComments}
                  setLoadingVideo={setLoading}
                  setLoadingSlider={setLoadingSlider}
                  user={props.user}
                  setMedia={setMedia}
                  currentMedia={currentMedia}
                  setCurrentTime={setCurrentTime}
                  setErrorMessage={setErrorMessage}
                  projectName={props.project.projectName}
                />
              )
            }
          </div >
        ) : (
          <EmptyProject setComments={setComments} setLoadingVideo={setLoading} setLoadingSlider={setLoadingSlider} />
        )}
      </div >
      {showCommentBlock && <CommentBlock arrComments={commentFinal} />}
    </div >
  );
};
const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project,
  loading: state.project.loading
});

export default connect(mapStateToProps)(UploadMedia);
