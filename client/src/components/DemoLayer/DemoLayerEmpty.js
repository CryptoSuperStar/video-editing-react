import React from 'react';
import './DemoLayerEmpty.scss';
import introVidDesktop from "../../assets/vid/intro_desktop.mp4";
import introVidMobile from "../../assets/vid/intro_mobile.mp4";


const DemoLayerEmpty = ({setShowDemo}) => {
  
  const skipText = window.innerWidth <= 575 ? 'Skip' : 'SKIP TIPS';
  
  return (
    <div className="DemoLayer EmptyLayer">
  
      <div className="container" style={{overflow: 'hidden'}}>
        <div className="introVid__container">
          <video 
              id='introVideo'
              src={window.innerWidth <= 575 ? introVidMobile : introVidDesktop} 
              autoPlay={true} 
              playsInline 
              loop 
              muted
              controls={false}>
          </video>
          <label>
            Speed: 
            <input 
              type="range" min="0.25" max="1.5" step="0.25" defaultValue={1}
              onChange={(e)=>{
                document.querySelector('#introVideo').playbackRate = e.target.value;
              }}
            />
          </label>
        </div>
        <button className="skip__btn" onClick={() => {
          localStorage.showDemoLayer = false;
          setShowDemo(false);
        }}>{skipText}</button>
      </div>
    </div>
  );
};

export default DemoLayerEmpty;
