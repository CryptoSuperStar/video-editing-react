import React, {useEffect, useRef, useState} from 'react';
import Carousel from "nuka-carousel";
import './CarouselBlock.scss';

const CarouselBlock = (props) => {
  
  const slide = useRef(null);
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    if (slide.current && slide.current.height) {
      setTimeout(() => {
        setHeight(slide.current.height);
      },1000)
    }
  }, [props, localStorage.currentMedia, slide.current])
  
  const getLeftElement = e => {
    let left = window.innerWidth > 1600
      ? e.clientX - (window.innerWidth - localStorage.contentWidth - localStorage.sideWidth + 100)
      : window.innerWidth < 1600 && window.innerWidth > 575
        ? e.clientX - localStorage.sideWidth
        : e.clientX - 60
    props.setLeftOfSlider(left)
  }
  
  return (
    <div className="video__block--slider" onClick={e => getLeftElement(e)} style={{
      height: height !== 0 && height + 'px'
    }}>
      <Carousel slidesToShow={window.innerWidth <= 575 ? 3 : 5}
                heightMode="first"
                defaultControlsConfig={{
                  nextButtonText: '>',
                  prevButtonText: '<',
                  pagingDotsStyle: {
                    display: "none"
                  }
                }}
                style={{
                  height: height !== 0 && height + 'px'
                }}
        >
        {props.screens && props.screens.length > 0 && props.screens.map((item, i) => (
          <div className="video__block--inner" key={i}>
            <img src={item.screenSrc} alt={item.screenSrc}
                 onClick={() => props.handleActiveScreenshot(i)}
                 style={{border: props.activeIndex === i && '2px solid #3b8590'}}
                 ref={slide}
            />
            {item.comment.text.length > 0 &&
            <div className="comment__indicate">
              <span/>
            </div>}
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselBlock;
