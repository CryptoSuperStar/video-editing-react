import React, { useState, useEffect, Fragment } from 'react';
import { connect } from "react-redux";
import './LoginRegister.scss';
import { Link, Redirect } from "react-router-dom";
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
// import AppleSignin from 'react-apple-signin-auth';
import { REACT_APP_FACEBOOK_API, REACT_APP_GOOGLE_API } from "../../utils/misc";
import emailImage from '../../assets/img/icon-simple-email-1@1x.png'
import screen10 from '../../assets/img/screen10.png';
import ConnectSocialModal from "../connectSocialModal/ConnectSocialModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  registerUserSSO,
  passwordResetSSO,
  passwordResetUpdateSSO,
  loginUserSSO,
  loginRegisterGoogle,
  loginRegisterFacebook, loginRegisterApple, authUser,
  updateUser,
} from "../../store/actions/auth.action";
import { toast } from "react-toastify";

const LoginRegister = (props) => {

  const [passwordResetToken, setPasswordResetToken] = useState(null);
  const [isLogin, setIsLogin] = useState('');
  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showConnectSocial, setShowConnectSocial] = useState(false);
  const [showStepTwo, setShowStepTwo] = useState(false);
  const [showPassword, setShowPassword] = useState(false)
  const [passwordsNotEquals, setPasswordsNotEquals] = useState(false);
  const [emailNotEquals, setEmailNotEquals] = useState(false);
  const [notValidFEmail, setNotValidEmail] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [notValidUserName, setNotValidUserName] = useState(false)



  const isValidUserName = (userName) => {
    const regex = /^[A-Za-z][A-Za-z0-9_]*(?:_[A-Za-z0-9]+)*$/;

    if (userName == null) {
      toast.warning("UserName required");
      return false;

    }
    if (userName.match(regex)) {
      return true
    } else {
      setNotValidUserName(true);
      return false
    };
  }
  useEffect(() => {
    if (props.location.pathname === "/password_reset") {
      setShowLoginRegister(true)
      setIsLogin('Password Reset')

      const params = new URLSearchParams(window.location.search)

      if (params.has('token')) {
        setPasswordResetToken(params.get('token'));
      }
    } else if (props.location.pathname === "/sign_in") {
      setShowLoginRegister(false)
      setIsLogin('Sign In')
      setPasswordResetToken(null);
    } else {
      setShowLoginRegister(false)
      setIsLogin("Sign Up")
      setPasswordResetToken(null);
    }
    setEmail('');
    setPassword('')
  }, [props.location.pathname])


  const onFailedTwitter = (error) => {
    setShowStepTwo(false);
    console.error(error);
  }

  const responseFacebook = async response => {
    console.log(response);
    await props.dispatch(loginRegisterFacebook(response.userID, response.accessToken, setShowStepTwo, isLogin));
    !showStepTwo && await props.dispatch(authUser());
  }

  const responseGoogle = async response => {
    await props.dispatch(loginRegisterGoogle(response.tokenId, setShowStepTwo, isLogin));
    !showStepTwo && await props.dispatch(authUser());
  }

  const responseApple = async response => {
    await props.dispatch(loginRegisterApple(response, setShowStepTwo, isLogin));
    !showStepTwo && await props.dispatch(authUser());
  }
  const validation = () => {
    if (isValidUserName(userName)) {
      return true
    } else {
      return false
    }
  }
  const signUp = async (userRole) => {
    if (showLoginRegister) {
      const userCreated = await props.dispatch(registerUserSSO({userName, userRole: userRole, email: email.toLocaleLowerCase(), password }, setShowStepTwo));
      const data = userCreated && await props.dispatch(authUser());
      data?.user?.userRole && props.history.push('/dashboard/projects');
    } else if (!showLoginRegister) {
      const data = await props.dispatch(authUser());
      await props.dispatch(updateUser(data.user._id, { ...data.user, userRole: userRole }, setShowStepTwo, isLogin))
      data?.user?.userRole && props.history.push('/dashboard/upload');
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin === "Password Reset") {
      if (passwordResetToken) {
        console.log(passwordResetToken, password)
        await props.dispatch(passwordResetUpdateSSO({ token: passwordResetToken, password}, props.history));
      } else {
        await props.dispatch(passwordResetSSO({ email: email.toLocaleLowerCase()}, props.history));
      }
    }
    if (isLogin === "Sign In") {
      await props.dispatch(loginUserSSO({ email: email.toLocaleLowerCase(), password }, props.history));
      await props.dispatch(authUser());
    }
    if (isLogin === "Sign Up" && validation()) {
      setShowStepTwo(true)
    }
  }

  const passwordResetForm = (
    <form className="LoginRegister__form" onSubmit={handleSubmit}>
      <div className='formInputContainer'>
        <input type={showPassword ? "text" : "password"} value={password} required placeholder="Password"
          onChange={e => { setPasswordError(false); setPasswordsNotEquals(false); setPassword(e.target.value) }} />
        <div className='passwordIcon' onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </div>
        {passwordError && <div className="inlineErrorMsg">Use 8 or more characters with a mix of lowercase and uppercase letters, numbers & symbols</div>}
      </div>

      <button type="submit">
        Submit
      </button>
    </form>
  )

  const loginRegisterForm = (
    <form className="LoginRegister__form" onSubmit={handleSubmit}>
      {isLogin === 'Sign Up' && <>
        <div className='formInputContainer'>
          <input type="text" value={userName} required minLength="5" placeholder="Username"
            onChange={(e) => { setNotValidUserName(false); setUserName(e.target.value) }} />
          {notValidUserName && <div className="inlineErrorMsg">A valid username is required, spaces and special symbols are not allowed</div>}
        </div>

      </>}
      <div className='formInputContainer'>
        <input type="email" value={email} required minLength="4" placeholder="Email"
          onChange={(e) => { setNotValidEmail(false); setEmailNotEquals(false); setEmail(e.target.value) }} />
        {notValidFEmail && <div className="inlineErrorMsg">A valid email address is required to complete registration</div>}
      </div>

      {isLogin !== 'Password Reset' &&
        <div className='formInputContainer'>
          <input type={showPassword ? "text" : "password"} value={password} required placeholder="Password"
            onChange={e => { setPasswordError(false); setPasswordsNotEquals(false); setPassword(e.target.value) }} />
          <div className='passwordIcon' onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
          {passwordError && <div className="inlineErrorMsg">Use 8 or more characters with a mix of lowercase and uppercase letters, numbers & symbols</div>}
        </div>}



      <button type="submit">
        {isLogin === 'Password Reset' ? 'Send Link'
          : isLogin === 'Sign In' ? "Sign In" : "Sign Up"}
      </button>
      {isLogin === 'Sign In' && <Link to="/password_reset">Forgot password?</Link>}
    </form>
  )
  if (localStorage.isAuthenticated === 'true' && !showStepTwo) return <Redirect to={props.user.userRole === "editor" ? "/dashboard/projects" : "/dashboard/upload"} />
  return (
    <Fragment>
      {/* {showConnectSocial && <ConnectSocialModal />} */}
      {showStepTwo ? <div className=" container">
        <div className="registerStep2">
          <div >PLEASE CONFIRM :</div>

          <button onClick={() => signUp('customer')}>
            I am Uploading media to be edited
          </button>
        </div>
        <button className='backButton' onClick={() => setShowStepTwo(false)}>
          Go Back
        </button>
      </div> : <div className="LoginRegister container">
        <div className="LoginRegister__text">
          {isLogin === "Sign Up" && <span className="steps mobile__view">Step 1 of 2</span>}
          <h3 style={{ marginTop: isLogin === 'Sign up' && '0' }}>
            {isLogin === 'Password Reset' ?
              passwordResetToken ? 'Update Your Password' : 'Forgot password?'
                : isLogin === 'Sign In' ? 'Welcome Back' : 'Sign Up for MyVideosPro'}
          </h3>
          {passwordResetToken ?
            passwordResetForm
            :
            showLoginRegister
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
                {/* <AppleSignin
                  authOptions={{
                    clientId: 'com.example.web',
                    scope: 'email name',
                    redirectURI: 'http://localhost:3000/api/login_register_apple',
                    state: 'state',
                    nonce: 'nonce',
                    usePopup: true
                  }}
                  uiType="dark"
                  className="apple-auth-btn"
                  noDefaultStyle={false}
                  buttonExtraChildren={`${isLogin} with Apple`}
                  onSuccess={responseApple}
                  onError={(error) => console.error(error)}
                  skipScript={false}
                  iconProp={{ style: { margin: '10px 0 0 15px' } }}
                /> */}
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
        </div>
      </div>}
    </Fragment>
  );
}

const mapStateToProps = state => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated
}
)

export default connect(mapStateToProps)(LoginRegister);
