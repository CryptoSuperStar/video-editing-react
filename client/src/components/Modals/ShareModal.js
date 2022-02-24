import React from 'react';
import {connect} from "react-redux";
import {ReactComponent as Download} from "../../assets/img/download.svg";
import {ReactComponent as Instagram} from "../../assets/img/instagram.svg";
import {ReactComponent as Youtube} from "../../assets/img/youtube.svg";
import {ReactComponent as TikTok} from "../../assets/img/tik-tok.svg";
import {ReactComponent as OnlyFans} from "../../assets/img/OnlyFans_logo.svg";
import './ShareModal.scss';
import {authYouTube} from "../../store/actions/share.action";

const ShareModal = (props) => {
  
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
  
  return (
    <div className="ShareModal">
      <div className="ShareModal__inner">
        <strong>Share to</strong>
        <div className="ShareModal__buttons">
          <div className="ShareModal__buttons--download">
            <button><Download/></button>
            <span>Download</span>
          </div>
          <div className="ShareModal__buttons--instagram">
            <button><Instagram/></button>
            <span>Instagram</span>
          </div>
          <div className="ShareModal__buttons--youtube">
            <button onClick={handleYouTubeAuth}><Youtube/></button>
            <span>YouTube</span>
          </div>
          <div className="ShareModal__buttons--tiktok">
            <button><TikTok/></button>
            <span>TikTok</span>
          </div>
          <div className="ShareModal__buttons--onlyFans">
            <button><OnlyFans/></button>
            <span>OnlyFans</span>
          </div>
        </div>
      </div>
    </div>
  );
};



export default connect()(ShareModal);
