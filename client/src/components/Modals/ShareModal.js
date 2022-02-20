import React, { useState, useEffect } from "react";
import {connect} from "react-redux";
import {ReactComponent as Download} from "../../assets/img/download.svg";
import {ReactComponent as Instagram} from "../../assets/img/instagram.svg";
import {ReactComponent as Youtube} from "../../assets/img/youtube.svg";
import {ReactComponent as TikTok} from "../../assets/img/tik-tok.svg";
import {ReactComponent as OnlyFans} from "../../assets/img/OnlyFans_logo.svg";
import { REACT_APP_API_URL } from "../../utils/misc";
import './ShareModal.scss';
import {authYouTube} from "../../store/actions/share.action";
const ShareModal = (props) => {

  const [alert, setAlert] = useState(false);
  
  const handleYouTubeAuth = () => {
    localStorage.path = props.path;
    localStorage.name = props.name;
    localStorage.thumbnail = props.thumbnail;
    props.dispatch(authYouTube()).then((res) => {
      if (res.url) {
        window.location.href = res.url;
      }
    })
  }

  const handleDonwloadFile =  () => {
    const urlArray = props.path.split("/");
    const project_id = urlArray[3];
    const bucket = urlArray[4];
    const mediaName = urlArray[5];
    let link=document.createElement('a');
    link.href=`${REACT_APP_API_URL}/downloadFile/${project_id}/${bucket}/${mediaName}`
    link.download=mediaName;
    link.click()
    props.shareModal();
  }
  
  const Tempalert = () =>{
      setAlert(true);
      setTimeout(()=>{
        setAlert(false);
      }, 3000)
  }
  return (
    <div className="ShareModal">
      <div className="ShareModal__inner">
        <strong>Share to</strong>
        <div className="ShareModal__buttons">
          <div className="ShareModal__buttons--download">
            <button onClick={handleDonwloadFile}><Download/></button>
            <span>Download</span>
          </div>
          <div className="ShareModal__buttons--instagram">
            <button onClick={Tempalert}><Instagram/></button>
            <span>Instagram</span>
          </div>
          <div className="ShareModal__buttons--youtube">
            <button onClick={Tempalert}><Youtube/></button>
            <span>YouTube</span>
          </div>
          <div className="ShareModal__buttons--tiktok">
            <button onClick={Tempalert}><TikTok/></button>
            <span>TikTok</span>
          </div>
          <div className="ShareModal__buttons--onlyFans">
            <button onClick={Tempalert}><OnlyFans/></button>
            <span>OnlyFans</span>
          </div>
        </div>
        {alert&&
          <span style={{fontSize:"16px", color:"red"}}>functionality coming soon</span>
        }
      </div>
    </div>
  );
};



export default connect()(ShareModal);
