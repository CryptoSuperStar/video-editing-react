import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { connect } from "react-redux";
import momentDurationFormatSetup from "moment-duration-format";
import { ReactComponent as PlayButton } from "../../assets/img/play-button.svg";
import { ReactComponent as PauseButton } from "../../assets/img/pause-button.svg";

import './VideoPlayer.scss';
import { updateContent } from "../../store/actions/project.action";

momentDurationFormatSetup(moment);

const VideoPlayer = (props) => {

  const [widthVideo, setWidthVideo] = useState(0);
  const [isPlay, setIsPlay] = useState(false);
  const [isShowControl, setIsShowControl] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [endAt, setEndAt] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const player = useRef(null);

  useEffect(() => {
    setCurrentTime(props.currentMedia.startTime);
    if (player.current && props.currentMedia.startTime !== 0) {
      player.current.currentTime = props.currentMedia.startTime;
      setIsShowControl(true);
    }
  }, [props.currentMedia.startTime])

  useEffect(() => {
    if (props.currentMedia.endTime !== endAt) {
      setEndAt(props.currentMedia.endTime);
      setIsShowControl(true);
    }
  }, [props.currentMedia.endTime])

  useEffect(() => {
    if (props.moveTo) {
      setIsShowControl(true)
      setCurrentTime(props.moveTo);
      player.current.currentTime = moment.duration(props.moveTo).asMilliseconds();
    }
  }, [props.moveTo])

  const togglePlay = () => {
    setIsAutoPlay(!isAutoPlay);
    const method = player.current.paused ? 'play' : 'pause';
    method === "play" ? setIsPlay(true) : setIsPlay(false);
    player.current[method]();
  }

  const updateContents = index => {
    let newContent = [...props.content];
    let newCurrentMedia = { ...props.currentMedia };
    newContent[index] = newCurrentMedia;
    if (localStorage.comments) {
      let newComments = JSON.parse(localStorage.comments);
      newCurrentMedia = newCurrentMedia.screens.map((item, i) => {
        return newComments[i].text.length > 0 ? { ...item, comment: newComments[i] } : item
      })
      newContent[index].screens = newCurrentMedia;
      props.setComments([]);
    }
    props.dispatch(updateContent(newContent));
  }

  const handleUpdateTime = () => {
    props.setCurrentTime(player.current.currentTime);

    if (Math.round(player.current.currentTime) >= Math.round(endAt)) {
      const findIndex = props.content.findIndex(item => item._id === localStorage.currentMedia);
      if (findIndex !== props.content.length - 1) {
        if ((localStorage.updateComment && localStorage.updateComment === 'true')
          || (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true')) {
          updateContents(findIndex);
        }
        localStorage.currentMedia = props.content[findIndex + 1]._id;
        props.setMedia();
        setIsAutoPlay(true);
      } else {
        player.current.pause();
        setIsAutoPlay(false);
      }
    }
    setCurrentTime(player.current.currentTime);
  }

  const videoBlock = () => <video
    ref={player}
    src={props.currentMedia.mediaSrc}
    onLoadedData={(e) => {
      setWidthVideo(player.current.offsetWidth);
      // let timeEnd = moment.duration(player.current.duration, "seconds").format("hh:mm:ss", {trim: false});
      if (!props.currentMedia.endTime) {
        setEndAt(player.current.duration);
      }
      props.setCurrentMedia({ ...props.currentMedia, duration: player.current.duration });
    }}
    onError={(e) => {
      if (e.target.error.code) {
        props.setErrorMessage(e.target.error.message)
      }
    }
    }
    preload="metadata"
    style={{ width: widthVideo > localStorage.contentWidth && '100%' }}
    className="video"
    id="player__video viewer"
    onClick={togglePlay}
    onTimeUpdate={handleUpdateTime}
    autoPlay={isAutoPlay}
  >
    Video not supported
  </video>

  return (
    <div className="video-react"
      onMouseOver={() => setIsShowControl(true)}
      onMouseLeave={() => setIsShowControl(false)}>
      <div className="upload__title--mobil">
        <h5>Edit your media</h5>
        {/*<span>Lorem ipsum dolor sit amet</span>*/}
      </div>
      <div className="video__inner"
        style={{
          backgroundImage: props.currentMedia.isImage
            ? `url(${props.currentMedia.mediaSrc})`
            : (props.currentMedia.screens.length > 0
              && `url(${props.currentMedia.screens[1].screenSrc})`)
        }}>
        {!props.currentMedia.isImage && !props.currentMedia.isSupported && <span className="warning__message">Sorry, File is not supported.</span>}
        {props.errorMessage && <span className="warning__message">Sorry, File is not supported.</span>}
        {props.currentMedia.isImage ?
          <div className="image__block"><img src={props.currentMedia.mediaSrc} alt={props.currentMedia.mediaSrc} /></div>
          : videoBlock()}
      </div>

      {isShowControl && !props.errorMessage && !props.currentMedia.isImage &&
        <div className="video-controls" id="video-controls" style={{ width: widthVideo + 'px' }}>
          <button data-title={!isPlay ? "Play" : "Pause"} id="play" onClick={togglePlay}>
            {isPlay ? <PauseButton /> : <PlayButton />}
          </button>
          <div className="time">
            <time id="time-elapsed">
              {moment.duration(currentTime, 'seconds').format("hh:mm:ss", { trim: false })}
            </time>
            <span> / </span>
            <time id="duration">{moment.duration(endAt, 'seconds').format("hh:mm:ss", { trim: false })}</time>
          </div>
        </div>}
    </div>
  );
}

export default connect()(VideoPlayer);
