const initialState = {
  user: {
    email: '',
    userName: '',
    firstName: null,
    lastName: null,
    avatar: '',
    registeredWith: '',
    twitterId: '',
    facebookId: '',
    paymentId: '',
    phone: '',
    organisation: '',
    payments: []
  },
  isAuthenticated: false,
  loading: false
}

const authReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    
    case 'LOGIN_USER':
    case 'LOGIN_REGISTER_GOOGLE':
    case 'LOGIN_REGISTER_FACEBOOK': {
      if (payload.registering === true) localStorage.showDemoLayer = true;
      localStorage.token = payload.token;
      return {
        ...state,
        loading: false
      }
    }
    case 'REGISTER_USER':
      localStorage.showDemoLayer = true;
      localStorage.token = payload.token;
      return {
        ...state,
        loading: false
      }
    case 'AUTH_USER': {
      localStorage.isAuthenticated = true;
      return {
        ...state,
        user: payload.user,
        isAuthenticated: true
      }
    }
    case "UPDATE_USER":
    case 'CONNECT_SOCIAL': {
      return {
        ...state,
        user: payload.user,
        isAuthenticated: true
      }
    }
    case 'AUTH_USER_ERROR':
    case "REGISTER_USER_ERROR":
    case "LOGIN_USER_ERROR":
    case 'LOGIN_REGISTER_GOOGLE_ERROR':
    case 'LOGIN_REGISTER_FACEBOOK_ERROR':
      localStorage.isAuthenticated = false;
      localStorage.removeItem('token');
      return {
        user: {
          email: '',
          userName: '',
          avatar: ''
        },
        isAuthenticated: false,
      }
    case "LOGOUT":
      localStorage.removeItem('duration');
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('currentMedia');
      localStorage.removeItem('currentPublishedMedia');
      localStorage.isAuthenticated = false;
      return {
        user: {
          email: '',
          userName: '',
          avatar: ''
        },
        isAuthenticated: false
      }
    case 'UPDATE_USER_ERROR':
    case 'CONNECT_SOCIAL_ERROR':
    default:
      return state;
  }
}

export default authReducer;
