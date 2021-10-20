import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import MoonLoader from "react-spinners/MoonLoader";
import ClockLoader from "react-spinners/PuffLoader";
import moment from 'moment';
import momentDurationFormatSetup from"moment-duration-format";
import './UploadMedia.scss';
import StyleInspirationModal from "../Modals/StyleInspirationModal";
import cam from '../../assets/img/icon-awesome-video-1@1x.png';
import {ReactComponent as Delete} from "../../assets/img/delete.svg";
import {ReactComponent as Chat} from "../../assets/img/chat.svg";
import {ReactComponent as Share} from "../../assets/img/share.svg";
import {ReactComponent as Info} from "../../assets/img/information.svg";
import {clearTempProject, getProject} from "../../store/actions/project.action";
import CommentBlock from "../CommentBlock/CommentBlock";
import ShareModal from "../Modals/ShareModal";
import EmptyProject from "../EmptyProject/EmptyProject";
import TimeLine from "../TimeLine/TimeLine";
import VideoPlayer from "../VideoPlayer/VideoPlayer";
import CarouselMedia from "../CarouselBlock/CarouselMedia";
import {ReactComponent as Cut} from "../../assets/img/cut.svg";
import DemoLayerUpload from "../DemoLayer/DemoLayerUpload";

momentDurationFormatSetup(moment);

const UploadMedia = (props) => {
  
  const [currentMedia, setCurrentMedia] = useState({
    mediaName: '',
    mediaSrc: '',
    duration: 0,
    startTime: 0,
    endTime: 0,
    screens: []
  })
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showCutBox, setShowCutBox] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState([]);
  const [activeComment, setActiveComment] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isShowComment, setIsShowComment] = useState(false);
  const [showCommentBlock, setShowCommentBlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loadingSlider, setLoadingSlider] = useState(false);
  const [moveTo, setMoveTo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null)
  const [showDemo, setShowDemo] = useState(false);
  
  useEffect(() => {
    if (localStorage.showDemoLayer === true) {
      setShowDemo(true)
    }
  },[])
  
  useEffect(() => {
    if (localStorage.currentProjectId) {
      setLoading(true);
      props.dispatch(getProject(localStorage.currentProjectId, setLoading));
    } else {
      localStorage.removeItem('duration');
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentMedia');
      localStorage.removeItem('comments');
    }
  },[localStorage.currentProjectId])
  
  useEffect(() => {
    if (localStorage.currentMedia && props.project.projectName && props.project.content.length > 0) {
      setMedia()
    }
  },[localStorage.currentMedia, props.project.content])
  
  useEffect(() => {
    if (currentMedia.mediaName && currentMedia.screens.length > 0) {
      let commentsArray = currentMedia.screens.map(item => item.comment);
      localStorage.comments = JSON.stringify(commentsArray);
      setComments(commentsArray);
      }
  },[props.project.projectName, localStorage.currentMedia ,currentMedia.screens.length])
  
  const setMedia = () => {
    let curMedia = props.project.content.filter(item => item._id === localStorage.currentMedia)[0];
    if (!curMedia) {
      curMedia = props.project.content[0]
    }
    if (curMedia.screens.length > 0) {
      curMedia.screens.sort((a,b) => moment.duration(a.time).asSeconds() - moment.duration(b.time).asSeconds());
    }
    setCurrentMedia(curMedia);
  }
  
  const handleClear = () => {
    setComments([]);
    setCurrentMedia({mediaName: '', mediaSrc: '', screens: [], duration: 0, endTime: 0, startTime: 0});
    props.dispatch(clearTempProject(props.project._id, props.project.bucket));
  }
  
  const handleCutVideo = () => {
    setShowCutBox(!showCutBox);
  }
  
  const handleActiveScreenshot = (idx) => {
    setIsShowComment(true);
    setActiveComment(comments[idx] && comments[idx].text)
  }
  
  const handleCommentChange = (e) => {
    setActiveComment(e.target.value);
  }
  const handleCommentEnter = (e) => {
    setIsShowComment(false);
    let newCommentsArray = [...comments];
    
    const findClosest = (arr,num) => {
      if(arr == null) {
        return
      }
    
      let closest = arr[0];
      for(let item of arr){
        if(Math.abs(moment.duration(item.time).asSeconds() - num)<Math.abs(moment.duration(closest.time).asSeconds() - num)){
          closest = item;
        }
      }
      return closest;
    }
    
    const nearestTime = findClosest(comments, currentTime);
    let newActiveIndex = comments.findIndex(com => com.time === nearestTime.time);
    setActiveIndex(newActiveIndex);
    let comment = {
        text: activeComment,
        createdAt: new Date(),
        time: moment.duration(currentTime, 'seconds').format("hh:mm:ss", {trim: false})
      }
    newCommentsArray[newActiveIndex] = comment;
    let newScreens = currentMedia.screens.map((scr, i) => {
      return i === newActiveIndex ? {...scr, comment: comment} : scr;
    })
    setCurrentMedia({...currentMedia, screens: newScreens})
    localStorage.comments = JSON.stringify(newCommentsArray);
    localStorage.updateComment = true;
    setComments(newCommentsArray);
    setActiveComment('')
  }
  
  const toggleCommentBlock = () => setShowCommentBlock(!showCommentBlock);
  const toggleShareBlock = () => setShowShareModal(!showShareModal);
  
  if(loading) return <div className="spinner__wrapper">
    <MoonLoader className="spinner" color="#000" loading={loading} size={50}/>
  </div>
  return (
    <div className="upload__media">
      {showDemo && localStorage.currentProjectId && <DemoLayerUpload setShowDemo={setShowDemo}/>}
      {showStyleModal && <StyleInspirationModal
        setShowStyleModal={setShowStyleModal}
        user={props.user}
        project={props.project}
        setLoading={setLoading}
        comments={comments}
        currentMedia={currentMedia}
        content={props.project.content}
        setComments={setComments}
      />}
      <div className="upload__media--inner">
        {currentMedia.mediaName && props.project.projectName ?
        <div className="video__block" style={{marginTop: (window.innerWidth <= 575 && showCommentBlock) && '0'}}>
          <div className="video__indicators" style={{zIndex: showDemo && '101'}}>
            <div className="comments_indicator" onClick={toggleCommentBlock}>
              <Chat/>
              <span className="comments__total" >
                {comments && comments.length && comments.filter(comment => comment.text.length > 0).length}
              </span>
            </div>
            <div className="share_indicator" onClick={toggleShareBlock}>
              <Share/>
            </div>
            <div className="question_indicator">
              <Info/>
            </div>
          </div>
          <VideoPlayer currentMedia={currentMedia} setCurrentMedia={setCurrentMedia}
                       moveTo={moveTo} setMedia={setMedia} content={props.project.content}
                       setCurrentTime={setCurrentTime} errorMessage={errorMessage}
                       setErrorMessage={setErrorMessage} setComments={setComments}
                       
          />
          {showShareModal && currentMedia.screens.length > 0 && <ShareModal
            path={currentMedia.mediaSrc}
            name={currentMedia.mediaName}
            thumbnail={currentMedia.screens[0].screenSrc}
          />}
          {loadingSlider
          &&
          <div className="spinner__wrapper--slider">
            <h3>Generate Timeline Bar</h3>
            <ClockLoader className="spinner" color="#696871" loading={setLoadingSlider} size={25}/>
          </div>
          }
          {currentMedia.isImage && <div className="TimeLine"/>}
          {(!loadingSlider && currentMedia.screens.length > 0) &&
            <TimeLine currentMedia={currentMedia}
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
            />}
          <div className="generate__btns">
            <button onClick={handleCutVideo} style={{backgroundColor: showCutBox && 'gray'}}>
              <Cut />
              <span>Cut</span>
            </button>
            <button onClick={handleClear}>
              <Delete/>
              <span>Clear</span>
            </button>
            <button onClick={() => setShowStyleModal(true)}>
              <img src={cam} alt="cam"/>
              <span>Generate Video</span>
            </button>
           
            <button onClick={handleActiveScreenshot} style={{backgroundColor: isShowComment && 'gray'}}>
              <Chat />
              <span>Comment</span>
            </button>
          </div>
          
          {props.project.content && props.project.content.length > 0
              && <CarouselMedia content={props.project.content}
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
          }
        </div>
        : <EmptyProject setComments={setComments} setLoadingVideo={setLoading} setLoadingSlider={setLoadingSlider}/>
      }</div>
      {showCommentBlock && <CommentBlock arrComments={comments}/>}
    </div>
  )
}
const mapStateToProps = state => ({
  user: state.auth.user,
  project: state.project.project,
  loading: state.project.loading
})

export default connect(mapStateToProps)(UploadMedia);
