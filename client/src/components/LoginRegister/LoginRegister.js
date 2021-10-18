import React, {useState, useEffect, Fragment} from 'react';
import {connect} from "react-redux";
import './LoginRegister.scss';
import {Link, Redirect} from "react-router-dom";
import TwitterLogin from 'react-twitter-auth/lib/react-twitter-auth-component.js';
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin  } from 'react-google-login';
import AppleSignin from 'react-apple-signin-auth';
import {REACT_APP_FACEBOOK_API, REACT_APP_GOOGLE_API} from "../../utils/misc";
import emailImage from '../../assets/img/icon-simple-email-1@1x.png'
import screen10 from '../../assets/img/screen10.png';
import ConnectSocialModal from "../connectSocialModal/ConnectSocialModal";
import {
  registerUserSSO,
  loginUserSSO,
  loginRegisterGoogle,
  loginRegisterFacebook, loginRegisterApple, authUser
} from "../../store/actions/auth.action";
import {toast} from "react-toastify";

const LoginRegister = (props) => {
  
  const [isLogin, setIsLogin] = useState('');
  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordsEquals, setPasswordsEquals] = useState(false);
  const [showConnectSocial, setShowConnectSocial] = useState(false);
  
  useEffect(() => {
    if (props.location.pathname === "/sign_in") {
      setIsLogin('Sign In')
    } else setIsLogin("Sign Up")
    setEmail('');
    setPassword('');
    setConfirmPassword('')
  },[props.location.pathname])
  
  useEffect(() => {
    password.trim() === confirmPassword.trim()
      ? setPasswordsEquals(true)
      : setPasswordsEquals(false);
  }, [password, confirmPassword])
  
  const onFailedTwitter = (error) => {
    setShowConnectSocial(false);
    console.error(error);
  }
  
  const onSuccessTwitter = (response) => {
    response.json().then(({token}) => {
      if (token) {
        // localStorage.token = token;
        setShowConnectSocial(true)
      }
    });
  }
  
  const responseFacebook = response => {
    console.log(response);
    props.dispatch(loginRegisterFacebook(response.userID, response.accessToken, setShowConnectSocial, isLogin));
    props.dispatch(authUser());
  }
  
  const responseGoogle = response => {
    props.dispatch(loginRegisterGoogle(response.tokenId, setShowConnectSocial, isLogin));
    props.dispatch(authUser());
  }
  
  const responseApple = response => {
    props.dispatch(loginRegisterApple(response, setShowConnectSocial, isLogin));
    props.dispatch(authUser());
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin === "Sign In") {
      props.dispatch(loginUserSSO({email, password}, props.history));
      props.dispatch(authUser());
    }
    if (isLogin === "Sign Up" && passwordsEquals) {
      props.dispatch(registerUserSSO({email, password}, setShowConnectSocial));
      props.dispatch(authUser());
    } else if(isLogin === "Sign Up" && !passwordsEquals){
      toast.warning("Passwords aren't equals");
    }
  }
  
  const loginRegisterForm = (
    <form className="LoginRegister__form" onSubmit={handleSubmit}>
      <input type="email" value={email} required minLength="5"  placeholder="Email"
             onChange={(e) => setEmail(e.target.value)}/>
      <input type="password" value={password} required minLength="8" placeholder="Password"
             onChange={e => setPassword(e.target.value)}/>
      {isLogin === 'Sign Up' &&
      <input type="password" value={confirmPassword} required minLength="8" placeholder="Confirm Password"
        onChange={e => setConfirmPassword(e.target.value)}/>}
      <button type="submit">{isLogin === 'Sign In' ? "Sign In" : "Sign Up"}</button>
      {isLogin === 'Sign In' && <Link to="">Forgot password?</Link>}
    </form>
  )
  if (localStorage.isAuthenticated === 'true') return <Redirect to="/" />
  return (
    <Fragment>
      {showConnectSocial && <ConnectSocialModal />}
      <div className="LoginRegister container">
        <div className="LoginRegister__text">
          {isLogin === "Sign Up" && <span className="steps mobile__view">Step 1 of 2</span>}
          <h3 style={{marginTop: isLogin === 'Sign up' && '0'}}>
            {isLogin === 'Sign In' ? 'Welcome Back' : 'Sign Up for ProVid'}
          </h3>
          <p className="web__view">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          <p className="mobile__view">Sign into your account</p>
          {showLoginRegister
            ? loginRegisterForm
            : (<div className="LoginRegister__social_login">
              <TwitterLogin
                loginUrl="http://localhost:3000/api/auth/twitter"
                onFailure={onFailedTwitter}
                onSuccess={onSuccessTwitter}
                requestTokenUrl="http://localhost:3000/api/auth/twitter/reverse"
                text={`${isLogin} with Twitter`}
                className="twitter_login__button"
                showIcon={true}
                disabled={true}
              />
              <FacebookLogin
                appId={REACT_APP_FACEBOOK_API}
                autoLoad={false}
                callback={responseFacebook}
                textButton={`${isLogin} with Facebook`}
                cssClass="facebook__button"
                icon="fa-facebook"
                disableMobileRedirect={true}
              />
              <GoogleLogin
                clientId={`${REACT_APP_GOOGLE_API}`}
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy={'single_host_origin'}
                className="google__button"
              >{`${isLogin} with Google`}
              </GoogleLogin>
              <AppleSignin
                authOptions={{
                  clientId: 'com.example.web',
                  scope: 'email name',
                  redirectURI: 'http://localhost:3000/api/login_register_apple',
                  /** State string that is returned with the apple response */
                  state: 'state',
                  /** Nonce */
                  nonce: 'nonce',
                  /** Uses popup auth instead of redirection */
                  usePopup: true
                }} // REQUIRED
                /** General props */
                uiType="dark"
                /** className */
                className="apple-auth-btn"
                /** Removes default style tag */
                noDefaultStyle={false}
                /** Allows to change the button's children, eg: for changing the button text */
                buttonExtraChildren={`${isLogin} with Apple`}
                /** Extra controlling props */
                /** Called upon signin success in case authOptions.usePopup = true -- which means auth is handled client side */
                onSuccess={responseApple} // default = undefined
                /** Called upon signin error */
                onError={(error) => console.error(error)} // default = undefined
                /** Skips loading the apple script if true */
                skipScript={false} // default = undefined
                /** Apple image props */
                iconProp={{ style: { margin: '10px 0 0 15px' } }} // default = undefined
                /** render function - called with all props - can be used to fully customize the UI by rendering your own component  */
                
              />
              <button className="email__button" onClick={() => setShowLoginRegister(true)}>
                <img src={emailImage} alt="email_image"/>
                <span>{isLogin} with Email</span>
              </button>
            </div>)
          }
          
          {isLogin === 'Sign In'
            ? <span>Don't have an account?<Link to="/sign_up"> Sign up</Link></span>
            : <span>Already have an account?<Link to="/sign_in"> Sign in</Link></span>}
      
        </div>
        <div className="LoginRegister__image web__view">
          <img src={screen10} alt="screen10"/>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
      </div>
    </Fragment>
  );
}

const mapStateToProps = state => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated
  }
)

export default connect(mapStateToProps)(LoginRegister);
