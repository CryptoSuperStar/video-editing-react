import React from 'react';
import './DemoLayerEmpty.scss';
import ToolTip from "./ToolTip";
import arrowEmpty from "../../assets/img/arrow_empty18930.png";
import arrowEmptyMobile from "../../assets/img/arrowEmptyMobile.png";
import introVid from "../../assets/img/intro.mp4";

const DemoLayerEmpty = ({setShowDemo}) => {
  
  const arrowSrc = window.innerWidth <= 575 ? arrowEmptyMobile : arrowEmpty
  const skipText = window.innerWidth <= 575 ? 'Skip' : 'SKIP TIPS';
  
  return (
    <div className="DemoLayer EmptyLayer">
  
      <div className="container" style={{overflow: 'hidden'}}>
        <div className="introVid__container">
          <video src={introVid} autoPlay playsInline loop controls={false} />
          <label>
            Speed: 
            <input 
              type="range" min="0.25" max="1.5" step="0.25" defaultValue={1}
            />
          </label>
        </div>
        {/* <ToolTip
          title="Upload your media"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          src={arrowSrc}
          name="DemoLayer__tooltip"
          /> */}
        <button className="skip__btn" onClick={() => {
          localStorage.showDemoLayer = false;
          setShowDemo(false);
        }}>{skipText}</button>
      </div>
    </div>
  );
};

export default DemoLayerEmpty;
