import React, {useState} from 'react';
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton
} from "react-share";
import './ShareLinkModal.scss';
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {ReactComponent as ArrowLeft} from "../../assets/img/arrow-left.svg";
import penDot from "../../assets/img/penDot.png";

const ShareLinkModal = (props) => {
  
  const url = "provids.herokuapp.com/";
  const title = 'Provid - some text'
  const [link, setLink] = useState('')
  
  return (
    <div className="ShareLinkModal modal__wrapper">
      <div className="pay__wall--modal">
        <div className="connectSocial__cross" onClick={() => props.setShowUpdateModal(false)}>
          <Cancel fill="black" className="connectSocial__cross--cancel"/>
          <ArrowLeft className="connectSocial__cross--arrowLeft"/>
        </div>
        <h3>Share Link</h3>
        <p>Lorem ipsum dolor sit amet</p>
        <form className="pay__modal--form">
          <label className="pay__form--creditCard">
            <span>Your Link</span>
            <input type="text" value={link} onChange={e => setLink(e.target.value)} required/>
            <img src={penDot} alt="pen"/>
          </label>
        </form>
        <div className="share__link">
          <TwitterShareButton title={url} url={link}>
            <TwitterIcon size={64} round={true}/>
          </TwitterShareButton>
          <FacebookShareButton url={url} quote={link}>
            <FacebookIcon size={64} round={true}/>
          </FacebookShareButton>
          <LinkedinShareButton url={url} title={link} summary={title}>
            <LinkedinIcon size={64} round={true} />
          </LinkedinShareButton>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
