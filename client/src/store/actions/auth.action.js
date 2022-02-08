import axios from 'axios';
import { REACT_APP_API_URL } from '../../utils/misc';
import { toast } from "react-toastify";
import setAuthToken from '../../utils/authToken';

export const authUser = () => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const res = await axios.get(`${REACT_APP_API_URL}/auth`);
      dispatch({
        type: 'AUTH_USER',
        payload: res.data
      })
      return res.data
    } catch (e) {
      toast.error('Auth error.')
      dispatch({
        type: "AUTH_USER_ERROR"
      })
    }
  }
}

export const registerUserSSO = (data, func) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/registerSSO`, data);
    dispatch({
      type: 'REGISTER_USER',
      payload: res.data
    })
    toast.success('User was created')
    return true
  } catch (e) {
    func(false);
    console.error('Register', e.response.data.msg)
    toast.error(e.response.data.msg)
    // dispatch({
    //   type: "REGISTER_USER_ERROR"
    // })
    return false
  }
}

export const passwordResetSSO = (data, func) => async dispatch => {
  const email = data.email
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/passwordResetSSO`, { email });
    if (res.data?.success === true) {
      console.log('succesfully things')
      // dispatch({
      //   type: 'UPDATE_USER',
      //   payload: res.data
      // });
      toast.success(`Email sent. Please check your inbox.`);
      //func(false)
    } else if (res.data?.success === false) {
      toast.error(`There is no such user with that email.`);
    }
  } catch (e) {
    console.log(e);
    toast.error("Something went wrong")
    // dispatch({
    //   type: "UPDATE_USER_ERROR"
    // })
  }
}

export const passwordResetUpdateSSO = (data, func) => async dispatch => {
  const { token, password } = data
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/passwordResetUpdateSSO`, { token, password });
    if (res.data?.success === true) {
      console.log('succesfully things')
      // dispatch({
      //   type: 'UPDATE_USER',
      //   payload: res.data
      // });
      toast.success(`Your password is updated.`);
      //func(false)
    } else if (res.data?.success === false) {
      toast.error(`Invalid or expired link.`);
    }
  } catch (e) {
    console.log(e);
    toast.error("Something went wrong")
    // dispatch({
    //   type: "UPDATE_USER_ERROR"
    // })
  }
}

export const loginUserSSO = (data, history) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/loginSSO`, data);
    dispatch({
      type: 'LOGIN_USER',
      payload: res.data
    })
    toast.success("You're logged in");
    // history.push('/dashboard/upload')
  } catch (e) {
    console.error('auth_action', e)
    toast.error("Log in error");
    dispatch({
      type: "LOGIN_USER_ERROR"
    })
  }
}

export const loginRegisterGoogle = (idToken, func, action) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/login_register_google`, { idToken });

    dispatch({
      type: 'LOGIN_REGISTER_GOOGLE',
      payload: res.data
    });
    toast.success(`Google ${action} success`);
    console.log(res.data)
    res.data.registering && func(true)
  } catch (error) {
    dispatch({
      type: 'LOGIN_REGISTER_GOOGLE_ERROR'
    })
    toast.error(`Google ${action} error. ${error.response.data.msg}`)
    func(false)
  }
}

export const loginRegisterFacebook = (userId, accessToken, func, action) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/login_register_facebook`, { userId, accessToken });
    dispatch({
      type: 'LOGIN_REGISTER_FACEBOOK',
      payload: res.data
    });
    toast.success(`Facebook ${action} success`);
    res.data.registering && func(true)
  } catch (error) {
    dispatch({
      type: 'LOGIN_REGISTER_FACEBOOK_ERROR'
    });
    toast.error(`Facebook ${action} error. ${error.response.data.msg}`)
    func(false)
  }
}

export const loginRegisterApple = (response, func, action) => async dispatch => {
  const { authorization, user } = response;
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/login_register_apple`, { authorization, user });
    dispatch({
      type: 'LOGIN_REGISTER_APPLE',
      payload: res.data
    });
    toast.success(`Apple ${action} success`);
    res.data.registering && func(true)
  } catch (error) {
    dispatch({
      type: 'LOGIN_REGISTER_APPLE_ERROR'
    });
    toast.error(`Apple ${action} error. ${error.response.data.msg}`)
    func(false)
  }
}

export const updateUser = (id, data, func, action) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/update_user`, { id, data, action });
    dispatch({
      type: 'UPDATE_USER',
      payload: res.data
    });
    if (action !== "Sign Up") {
      toast.success(`Your profile details have been updated`);
      func(false)
    }
  } catch (e) {
    console.log(e);
    toast.error(e.response.data.msg)
    dispatch({
      type: "UPDATE_USER_ERROR"
    })
  }
}

export const setConnectSocial = (social, link) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const res = await axios.put(`${REACT_APP_API_URL}/updateSocial`, { social, link })
      dispatch({
        type: 'CONNECT_SOCIAL',
        payload: res.data
      });
    } catch (e) {
      console.log(e)
      dispatch({
        type: 'CONNECT_SOCIAL_ERROR'
      });
    }
  }
}

export const resetPassword = (oldPass, newPass, func) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    console.log(oldPass, newPass)
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/resetPassword`, { oldPass, newPass });
      localStorage.token = res.data;
      toast.success('Your profile details have been updated')
      func(false);
    } catch (e) {
      console.log(e)
      toast.error("Something went wrong")
    }
  }
}
export const confirmPromoCode = (promoCode, func) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/confirm-promo-code`, { promoCode });
    if (res.data?.success === true) {
      dispatch({
        type: 'UPDATE_USER',
        payload: res.data
      });
      toast.success(`Promo code confirm`);
      func(false)
    } else {
      toast.error(`Wrong Promo code`);

    }
  } catch (e) {
    console.log(e);
    toast.error("Something went wrong")
    dispatch({
      type: "UPDATE_USER_ERROR"
    })
  }
}