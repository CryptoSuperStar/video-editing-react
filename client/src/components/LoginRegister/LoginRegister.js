import React, { useState, useEffect, Fragment } from 'react';
import { connect } from "react-redux";
import './LoginRegister.scss';
import { Link, Redirect } from "react-router-dom";
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import AppleSignin from 'react-apple-signin-auth';
import { REACT_APP_FACEBOOK_API, REACT_APP_GOOGLE_API } from "../../utils/misc";
import emailImage from '../../assets/img/icon-simple-email-1@1x.png'
import screen10 from '../../assets/img/screen10.png';
import ConnectSocialModal from "../connectSocialModal/ConnectSocialModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  registerUserSSO,
  loginUserSSO,
  loginRegisterGoogle,
  loginRegisterFacebook, loginRegisterApple, authUser,
  updateUser,
} from "../../store/actions/auth.action";
import { toast } from "react-toastify";

const LoginRegister = (props) => {

  const [isLogin, setIsLogin] = useState('');
  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConnectSocial, setShowConnectSocial] = useState(false);
  const [showStepTwo, setShowStepTwo] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordsNotEquals, setPasswordsNotEquals] = useState(false);
  const [emailNotEquals, setEmailNotEquals] = useState(false);
  const [passwordError, setPasswordError] = useState(false)
  const isValidPassword = (password) => {
    if (password.trim() === confirmPassword.trim()) {
      // Regex to check valid password.
      const regex = "^(?=.*[0-9])"
        + "(?=.*[a-z])(?=.*[A-Z])"
        + "(?=.*[!@#?$%^&+=])"
        + "(?=\\S+$).{8,20}$";

      if (password == null) {
        toast.warning("Password required");
        return false;
      }
      if (password.match(regex)) {
        return true
      } else {
        setPasswordError(true);
        return false
      };
    } else {
      setPasswordsNotEquals(true)

    }
  }
  const isValidEmail = (email) => {
    if (email.trim() === confirmEmail.trim()) {
      // Regex to check valid email.
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (email == null) {
        toast.warning("Email required");
        return false;

      }
      if (email.match(regex)) {
        return true
      } else {
        toast.warning("A valid email address is required to complete registration");
        return false
      };
    } else {
      setEmailNotEquals(true)
    }
  }
  const isValidUserName = (userName) => {
    const regex = /^[a-zA-Z0-9\-]+$/;

    if (userName == null) {
      toast.warning("UserName required");
      return false;

    }
    if (userName.match(regex)) {
      return true
    } else {
      toast.warning("A valid userName is required, Spaces and spacial symbols are not allowed");
      return false
    };
  }
  useEffect(() => {
    if (props.location.pathname === "/sign_in") {
      setIsLogin('Sign In')
    } else setIsLogin("Sign Up")
    setEmail('');
    setPassword('');
    setConfirmPassword('')
  }, [props.location.pathname])


  const onFailedTwitter = (error) => {
    setShowConnectSocial(false);
    console.error(error);
  }

  const responseFacebook = async response => {
    console.log(response);
    await props.dispatch(loginRegisterFacebook(response.userID, response.accessToken, setShowConnectSocial, isLogin));
    await props.dispatch(authUser());
  }

  const responseGoogle = async response => {
    await props.dispatch(loginRegisterGoogle(response.tokenId, setShowConnectSocial, isLogin));
    await props.dispatch(authUser());
  }

  const responseApple = async response => {
    await props.dispatch(loginRegisterApple(response, setShowConnectSocial, isLogin));
    await props.dispatch(authUser());
  }
  const validation = () => {
    if (isValidUserName(userName) && isValidEmail(email) && isValidPassword(password)) {
      return true
    } else {
      return false
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin === "Sign In") {
      await props.dispatch(loginUserSSO({ email, password }, props.history));
      await props.dispatch(authUser());
    }
    if (isLogin === "Sign Up" && validation()) {
      await props.dispatch(registerUserSSO({ firstName, lastName, userName, organization, email, password }, setShowConnectSocial));
      await props.dispatch(authUser());
    }
  }

  const loginRegisterForm = (
    <form className="LoginRegister__form" onSubmit={handleSubmit}>
      {isLogin === 'Sign Up' && <div>
        <input type="text" value={firstName} required minLength="2" placeholder="First Name"
          onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" value={lastName} required minLength="2" placeholder="Last Name"
          onChange={(e) => setLastName(e.target.value)} />
        <input type="text" value={userName} required minLength="5" placeholder="Username"
          onChange={(e) => setUserName(e.target.value)} />
        <input type="text" value={organization} placeholder="Organization (Optional)"
          onChange={(e) => setOrganization(e.target.value)} />
      </div>}
      <input type="email" value={email} required minLength="5" placeholder="Email"
        onChange={(e) => { setEmailNotEquals(false); setEmail(e.target.value) }} />
      {isLogin === 'Sign Up' && <div className='formInputContainer'> <input type="confirmEmail" value={confirmEmail} required minLength="5" placeholder="Confirm Email"
        onChange={(e) => { setEmailNotEquals(false); setConfirmEmail(e.target.value) }} />
        {emailNotEquals && <div className="inlineErrorMsg">Email did not match</div>}
      </div>}
      <div className='formInputContainer'>
        <input type={showPassword ? "text" : "password"} value={password} required placeholder="Password"
          onChange={e => { setPasswordError(false); setPasswordsNotEquals(false); setPassword(e.target.value) }} />
        <div className='passwordIcon' onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </div>
        {passwordError && <div className="inlineErrorMsg">Use 8 or more characters with a mix of lowercase and uppercase letters, numbers & symbols</div>}
      </div>


      {
        isLogin === 'Sign Up' && <>
          <div className='formInputContainer'>
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} required placeholder="Confirm Password"
              onChange={e => { setPasswordError(false); setPasswordsNotEquals(false); setConfirmPassword(e.target.value) }} />
            <div className='passwordIcon' onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {passwordsNotEquals && <div className="inlineErrorMsg">Passwords did not match</div>}
          </div>

        </>
      }
      <button type="submit">{isLogin === 'Sign In' ? "Sign In" : "Sign Up"}</button>
      {isLogin === 'Sign In' && <Link to="">Forgot password?</Link>}
    </form>
  )
  if (localStorage.isAuthenticated === 'true') return <Redirect to="/dashboard/upload" />
  return (
    <Fragment>
      {/* {showConnectSocial && <ConnectSocialModal />} */}
      <div className="LoginRegister container">
        <div className="LoginRegister__text">
          {isLogin === "Sign Up" && <span className="steps mobile__view">Step 1 of 2</span>}
          <h3 style={{ marginTop: isLogin === 'Sign up' && '0' }}>
            {isLogin === 'Sign In' ? 'Welcome Back' : 'Sign Up for ProVid'}
          </h3>
          <p className="web__view">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          <p className="mobile__view">Sign into your account</p>
          {showLoginRegister
            ? loginRegisterForm
            : (<div className="LoginRegister__social_login">
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
                <img src={emailImage} alt="email_image" />
                <span>{isLogin} with Email</span>
              </button>
            </div>)
          }

          {isLogin === 'Sign In'
            ? <span>Don't have an account?<Link to="/sign_up"> Sign up</Link></span>
            : <span>Already have an account?<Link to="/sign_in"> Sign in</Link></span>}

        </div>
        <div className="LoginRegister__image web__view">
          <img src={screen10} alt="screen10" />
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
      </div>
      }
    </Fragment >
  );
}

const mapStateToProps = state => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated
}
)

export default connect(mapStateToProps)(LoginRegister);
