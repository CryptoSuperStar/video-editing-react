import React from 'react';
import ToolTip from "./ToolTip";
import arrowComm from "../../assets/img/arrowComm.png";
import arrowCut from "../../assets/img/arrowCut.png";
import arrowClear from "../../assets/img/arrowClear.png";
import arrowVideo from "../../assets/img/arrowVideo.png";
import arrowAddC from "../../assets/img/arrowAddC.png";
import arrowAddVideo from "../../assets/img/arrowAddVideo.png";
import './DemoLayerUpload.scss';

const DemoLayerUpload = ({setShowDemo}) => {
  
  const skipText = window.innerWidth <= 575 ? 'Skip' : 'SKIP TIPS';
  
  return (
    <div className="DemoLayer UploadLayer">
      <div className="container" style={{position:'relative', height: '100%', overflow: 'hidden'}}>
        <ToolTip title="Comments"
                 text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                 src={arrowComm}
                 name="DemoLayer__tooltip comm_tooltip"
                 
        />
        <ToolTip title="Option 1"
                 text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                 src={arrowCut}
                 name="DemoLayer__tooltip cut_tooltip"
                 
        />
        <ToolTip title="Option 2"
                 text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                 src={arrowClear}
                 name="DemoLayer__tooltip clear_tooltip"
        />
        <ToolTip title="Option 3"
                 text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                 src={arrowVideo}
                 name="DemoLayer__tooltip video_tooltip"
        />
        <ToolTip title="Option 4"
                 text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                 src={arrowAddC}
                 name="DemoLayer__tooltip addC_tooltip"
        />
        <ToolTip title="Add Video"
                 text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                 src={arrowAddVideo}
                 name="DemoLayer__tooltip videAdd_tooltip"
        />
        <button className="skip__btn add_" onClick={() => {
          localStorage.showDemoLayer = false;
          setShowDemo(false);
        }}>{skipText}</button>
      </div>
    </div>
  );
};

export default DemoLayerUpload;
