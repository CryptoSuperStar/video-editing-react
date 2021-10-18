import React from 'react';
import './FooterNav.scss';
import logoTwitter from '../../assets/img/logo-twitter-2x@1x.png';
import logoFacebook from '../../assets/img/logo-fb-simple-2x@1x.png';
import logoGoogle from '../../assets/img/google-2x@1x.png';
import {Link} from "react-router-dom";

const FooterNav = () => {
  return (
    <div className="FooterNav container__inner web__view">
      <div className="FooterNav__social">
        <div className="FooterNav__social--text">Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor.
        </div>
        <div className="FooterNav__social--links">
          <Link to={{ pathname: "https://twitter.com" }} target="_blank">
            <img src={logoTwitter} alt="logoTwitter"/>
          </Link>
          <Link to={{ pathname: "https://facebook.com" }} target="_blank">
            <img src={logoFacebook} alt="logoFacebook"/>
          </Link>
          <Link to={{ pathname: "https://google.com" }} target="_blank">
            <img src={logoGoogle} alt="logoGoogle"/>
          </Link>
        </div>
      </div>
      <div className="FooterNav__about">
        <h5 className="FooterNav__title">About</h5>
        <Link to="/*" >Our mission</Link>
        <Link to="/*" >Our story</Link>
        <Link to="/*" >Team Members</Link>
      </div>
      <div className="FooterNav__learn">
        <h5 className="FooterNav__title">Learn</h5>
        <Link to="/*" >Tutorials</Link>
        <Link to="/*" >How  it works</Link>
        <Link to="/*" >F.A.Q</Link>
      </div>
      <div className="FooterNav__stories">
        <h5 className="FooterNav__title">Stories</h5>
        <Link to="/*" >Blog</Link>
        <Link to="/*" >Tech stories</Link>
      </div>
      <div className="FooterNav__contact">
        <h5 className="FooterNav__title">Contact us</h5>
        <span>support@provid.com</span>
        <span>+123-456-789</span>
      </div>
    </div>
  );
};

export default FooterNav;
