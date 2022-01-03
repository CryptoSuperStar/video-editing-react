import React, { useState, useRef, useEffect, Fragment } from 'react';
import moment from 'moment';
import momentDurationFormatSetup from "moment-duration-format";
import 'rc-slider/assets/index.css';
import './TimeLine.scss';
import { ReactComponent as Moon } from "../../assets/img/waning-moon.svg";
import { ReactComponent as Arrow } from "../../assets/img/next-2.svg";
import { mediaTypeAudio } from '../../utils/constant';

momentDurationFormatSetup(moment);

const TimeLine = props => {
  const timeLineBox = useRef(null);
  const [leftArrowPad, setLeftArrowPad] = useState(0);
  const [rightArrowPad, setRightArrowPad] = useState(0);
  const [shift, setShift] = useState(0);
  const [audioTimeStamp, setAudioTimeStamp] = useState([])
  useEffect(() => {
    if (props.currentMedia.mediaType === mediaTypeAudio) {
      let quantity = '';
      if (props.currentMedia.duration <= 30) {
        quantity = 6;
      } else if (props.currentMedia.duration > 30 && props.currentMedia.duration <= 60) {
        quantity = 7;
      } else {
        quantity = 9;
      }
      let stepInSeconds = props.currentMedia.duration / quantity;
      let audioTimeStampArray = [...Array(quantity)].map((item, i) => {
        let timeInFormat = moment.duration((stepInSeconds * (i + 1) - (stepInSeconds / 2)), 'seconds')
          .format("mm:ss:SSS", { trim: false })
        return { time: timeInFormat, frequency: [...Array(20)].map(i => Math.floor((Math.random() * 83) + 10)) };
      })
      setAudioTimeStamp(audioTimeStampArray);
    }
  }, [props.currentMedia.duration, props.currentMedia.mediaType])
  useEffect(
    () => {
      // let curMax = moment.duration(props.screens[props.screens.length - 1].time).asSeconds();
      setLeftArrowPad((props.currentMedia.startTime * 100) / props.currentMedia.duration);
    },
    [props.currentMedia.startTime]
  );

  useEffect(
    () => {
      setRightArrowPad(100 - (props.currentMedia.endTime * 100) / props.currentMedia.duration);
    },
    [props.currentMedia.endTime]
  );

  useEffect(
    () => {
      setShift((props.currentTime * 100) / props.currentMedia.duration);
    },
    [props.currentTime, props.currentMedia.duration]
  );
  const handleStepTime = (e) => {
    let leftPad = e.clientX - timeLineBox.current.getBoundingClientRect().left;
    let widthBox = timeLineBox.current.getBoundingClientRect().width;
    let newTime = props.currentMedia.duration * (leftPad / widthBox)
    props.setMoveTo(newTime);
    props.setCurrentTime(newTime);
    setShift(newTime * 100 / props.currentMedia.duration)
  }

  const resizeLeft = e => {
    const { left, width } = timeLineBox.current.getBoundingClientRect();
    let leftInPercentage = (e.pageX - left) * 100 / width;
    if ((e.pageX - left).toFixed(0) <= 0) return;
    if (100 - leftInPercentage - rightArrowPad <= 5) return;
    props.setCurrentMedia({ ...props.currentMedia, startTime: (props.currentMedia.duration / 100) * leftInPercentage })
  };

  const resizeLeftMobile = e => {
    const { left, width } = timeLineBox.current.getBoundingClientRect();
    let leftInPercentage = (e.changedTouches[0].pageX - left) * 100 / width;
    if ((e.changedTouches[0].pageX - left).toFixed(0) <= 0) return;
    if (100 - leftInPercentage - rightArrowPad <= 5) return;
    props.setCurrentMedia({ ...props.currentMedia, startTime: (props.currentMedia.duration / 100) * leftInPercentage })
  }

  const resizeRight = e => {
    const { left, width } = timeLineBox.current.getBoundingClientRect();
    let rightInPercentage = (e.pageX - left) * 100 / width;
    if (rightInPercentage >= 100) return false;
    if (100 - rightInPercentage + leftArrowPad >= 95) return false;
    props.setCurrentMedia({
      ...props.currentMedia,
      endTime: (props.currentMedia.duration / 100) * rightInPercentage
    })
  }
  const resizeRightMobile = e => {
    const { left, width } = timeLineBox.current.getBoundingClientRect();
    let rightInPercentage = (e.changedTouches[0].pageX - left) * 100 / width;
    if (rightInPercentage >= 100) return false;
    if (100 - rightInPercentage + leftArrowPad >= 95) return false;
    props.setCurrentMedia({
      ...props.currentMedia,
      endTime: (props.currentMedia.duration / 100) * rightInPercentage
    })
  }

  const stopResize = () => {
    window.removeEventListener("mousemove", resizeLeft);
    window.removeEventListener("mousemove", resizeRight);
    window.removeEventListener("touchmove", resizeLeftMobile);
    window.removeEventListener("touchmove", resizeRightMobile);
  };

  const leftPad = e => {
    localStorage.editedVideoTime = true;
    window.addEventListener('mousemove', resizeLeft)
    window.addEventListener('mouseup', stopResize);
    window.addEventListener('touchmove', resizeLeftMobile)
    window.addEventListener('touchend', stopResize);
  }

  const rightPad = e => {
    localStorage.editedVideoTime = true;
    window.addEventListener('mousemove', resizeRight)
    window.addEventListener('mouseup', stopResize)
    window.addEventListener('touchmove', resizeRightMobile)
    window.addEventListener('touchend', stopResize);
  }

  return (
    <div className="TimeLine" style={{ zIndex: localStorage.showTrimBox === 'true' && '' }}>
      <div className="TimeLine__inner" ref={timeLineBox}>
        <div className="video-progress"
          style={{ left: shift + "%", zIndex: "11" }} />

        {props.comments &&
          props.comments.map((comment, i) => comment.text.length > 0 &&
            <div key={i} onClick={(e) => { props.editComment(i); handleStepTime(e) }} className="comment__indicate" style={{ left: (comment.rawTime * 100 / props.currentMedia.duration) + "%", zIndex: "10", cursor: "pointer" }}>

              <span />
            </div>)}

        {props.currentMedia.screens.length > 0 ? <div className="TimeLine__inner--images" onClick={(e) =>
          handleStepTime(e)}> {props.currentMedia.screens.map((scr, i) => (
            <div className="TimeLine__image--item"
              key={scr._id}>
              <p>{scr.time}</p>
              <div className="insteadOfImg" style={{ backgroundImage: `url(${scr.screenSrc})` }} />
            </div>
          ))}
        </div> : <div className="TimeLine__inner--images">
          {audioTimeStamp.map((frame, i) => (
            <div className="TimeLine__image--item"
              key={i}>
              <p>{frame.time}</p>
              <div onClick={(e) =>
                handleStepTime(e)} className="audio-time-line" style={{ background: "gray" }}>
                {frame.frequency.map(i => <div style={{ background: "#00000090", width: "2%", height: `${i}%` }}></div>)}
              </div>
            </div>
          ))}
        </div>}

        <Fragment   >
          {props.showTrimBox && <div className="resizable__box" onClick={(e) => handleStepTime(e)} style={{
            left: leftArrowPad + "%",
            right: rightArrowPad + '%'
          }}>
            <div className="resizable__box--left-arrow" style={{ left: '-5px' }}
              onMouseDown={leftPad} onTouchStart={leftPad}>
              <Arrow />
            </div>
            <div className="resizable__box--right-arrow" style={{ right: '-5px' }}
              onMouseDown={rightPad} onTouchStart={rightPad}>
              <Arrow style={{ transform: 'rotateY(180deg)' }} />
            </div>
          </div>}
          <div className="left__background" style={{ width: leftArrowPad + '%' }} />
          <div className="right__background" style={{ width: rightArrowPad + '%' }} />
        </Fragment>

        {props.isShowComment &&
          <div className="comment__inner" style={{
            left: window.innerWidth > 575 && shift - 3.2 + "%",
            zIndex: localStorage.isShowComment === "true" && '120'
          }}>
            <textarea
              autoFocus={true}
              name="text"
              rows="1"
              placeholder="Add Your Comment"
              value={props.activeComment}
              defaultValue={props.editCommentValue && props.activeIndex ? props.comments?.[props.activeIndex].text : ""}
              onChange={e => { (props.projectStatus === "Draft" || props.projectStatus === "Complete") && !props.isEditor && props.handleCommentChange(e) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  props.handleCommentEnter()
                }
                if (e.key === "Escape") {
                  props.setIsShowComment(false);
                  props.setActiveComment('')
                  props.setEditCommentValue(false)
                }
              }}
            />
            <div className="square" style={{
              left: window.innerWidth < 575
                && (shift < 95 ? shift + "%" : '95%')
            }} />
            <div className="close__comment" onClick={() => {
              props.setIsShowComment(false);
              props.setActiveComment('')
              props.setEditCommentValue(false)
            }}>X
            </div>
            <Moon onClick={props.handleCommentEnter} />
          </div>}
      </div>
    </div >
  );
};

export default TimeLine;
