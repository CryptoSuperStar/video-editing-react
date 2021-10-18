import React from 'react';
import { withRouter } from 'react-router-dom';
import {connect} from "react-redux";
import './ConnectSocialModal.scss';
import InstagramLogin from 'react-instagram-login';
import { GoogleLogin  } from 'react-google-login';
import {ReactComponent as Instagram} from "../../assets/img/instagram.svg";
import {ReactComponent as Youtube} from "../../assets/img/youtube.svg";
import {ReactComponent as TikTok} from "../../assets/img/tik-tok.svg";
import {ReactComponent as OnlyFans} from "../../assets/img/OnlyFans_logo.svg";
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {REACT_APP_GOOGLE_API, REACT_APP_INSTAGRAM_API} from "../../utils/misc";
import {setConnectSocial, authUser} from "../../store/actions/auth.action";

const ConnectSocialModal = (props) => {
  
  const responseInstagramSuccess = (response) => {
    console.log(response);
  }
  
  const responseInstagramFailure = error => {
    console.error(error);
  }
  
  const responseGoogle = response => {
    localStorage.accessToken = response.accessToken;
    localStorage.tokenId = response.tokenId;
    localStorage.googleId = response.googleId;
    const link = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2Cstatus&key=`;
    props.dispatch(setConnectSocial('youTubeLink', link))
  }
  
  return (
    <div className="connectSocial__wrapper">
      <div className="connectSocial">
        <div className="connectSocial__cross" onClick={async () => {
          await props.dispatch(authUser());
          props.history.push('/dashboard/upload');
        }}>
          <Cancel fill="black"/>
        </div>
        <span className="steps">Step 2 of 2</span>
        <h3>Add your social networks</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
        <InstagramLogin
          clientId={REACT_APP_INSTAGRAM_API}
          onSuccess={responseInstagramSuccess}
          onFailure={responseInstagramFailure}
          cssClass="instagram_button"
          redirectUri="https://provids.herokuapp.com/sign_in"
        >
          <Instagram />
          <span>Connect Instagram</span>
        </InstagramLogin>
        <GoogleLogin
          clientId={`${REACT_APP_GOOGLE_API}`}
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
          className="google__button"
          icon={false}
        >
          <Youtube />
          <span>Connect YouTube</span>
        </GoogleLogin>
        <button className="tikTok__button">
          <TikTok />
          <span>Connect TikTok</span>
        </button>
        <button className="onlyFans__button">
          <OnlyFans />
          <span>Connect OnlyFans</span>
        </button>
      </div>
    </div>
  );
};

export default connect()(withRouter(ConnectSocialModal));
