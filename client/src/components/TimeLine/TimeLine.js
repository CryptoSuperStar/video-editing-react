import React, { useState, useRef, useEffect, Fragment } from 'react';
import moment from 'moment';
import momentDurationFormatSetup from "moment-duration-format";
import 'rc-slider/assets/index.css';
import './TimeLine.scss';
import { ReactComponent as Moon } from "../../assets/img/waning-moon.svg";
import { ReactComponent as Arrow } from "../../assets/img/next-2.svg";

momentDurationFormatSetup(moment);

const TimeLine = props => {
  const timeLineBox = useRef(null);
  const [leftArrowPad, setLeftArrowPad] = useState(0);
  const [rightArrowPad, setRightArrowPad] = useState(0);
  const [shift, setShift] = useState(0);

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
  const handleStepTime = (e, time, i) => {
    props.setActiveIndex(i);
    props.setActiveComment('');
    // props.comments.length > 0 && props.setActiveComment(props.comments[i].text);
    let leftPad = e.clientX - timeLineBox.current.getBoundingClientRect().left;
    let widthBox = timeLineBox.current.getBoundingClientRect().width;

    // let newTime = moment.duration(props.currentMedia.duration * (leftPad / widthBox), 'seconds')
    //   .format("mm:ss:SS", { trim: false })
    let newTime = props.currentMedia.duration * (leftPad / widthBox)
    const selectedComment = props.comments?.[i]?.length > 0 && props.comments[i].find(item => item.time === moment.duration(newTime, 'seconds').format("hh:mm:ss", { trim: false }))
    selectedComment && props.setActiveComment(selectedComment.text)
    props.setMoveTo(newTime);
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
    <div className="TimeLine" style={{zIndex: localStorage.showCutBox === 'true' && '110'}}>
      <div className="TimeLine__inner" ref={timeLineBox}>
        <div className="video-progress"
          style={{ left: shift + "%", zIndex: "11" }} />

        {/* {props.comments &&
          props.comments.map((comment, i) => comment.text.length > 0 &&
            <div key={i} onClick={(e) => { props.editComment(i); handleStepTime(e) }} className="comment__indicate" style={{ left: (comment.rawTime * 100 / props.currentMedia.duration) + "%", zIndex: "10", cursor: "pointer" }}>

              <span />
            </div>)} */}

        <div className="TimeLine__inner--images">{props.currentMedia.screens.map((scr, i) => (
          <div className="TimeLine__image--item" onClick={(e) =>
            handleStepTime(e, scr.time, i)}
            key={scr._id}>
            <p>{scr.time}</p>
            <div className="insteadOfImg" style={{ backgroundImage: `url(${scr.screenSrc})` }} />
          </div>
        ))}</div>

        <Fragment   >
          {props.showCutBox && <div className="resizable__box" onClick={(e) => handleStepTime(e)} style={{
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
            left: window.innerWidth > 575 && shift - 3.2 + "%" ,
            zIndex: localStorage.isShowComment === "true" && '120'
          }}>
            <textarea
              autoFocus={true}
              name="text"
              rows="1"
              placeholder="Add Your Comment"
              value={props.activeComment}
              defaultValue={props.editCommentValue && props.activeIndex ? props.comments[props.activeIndex].text : ""}
              onChange={e => props.handleCommentChange(e)}
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
