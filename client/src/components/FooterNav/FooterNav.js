import React from 'react';
import './FooterNav.scss';
import logoTwitter from '../../assets/img/logo-twitter-2x@1x.png';
import logoFacebook from '../../assets/img/logo-fb-simple-2x@1x.png';
import logoGoogle from '../../assets/img/google-2x@1x.png';
import {Link} from "react-router-dom";

const FooterNav = () => {
  return (
    <div className="FooterNav container__inner web__view">
      <div className="FooterNav__contact">
        <h5 className="FooterNav__title">Contact us</h5>
        <span>support@provid.com</span>
      </div>
    </div>
  );
};

export default FooterNav;
