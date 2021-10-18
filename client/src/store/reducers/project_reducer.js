import moment from 'moment';
import momentDurationFormatSetup from"moment-duration-format";
momentDurationFormatSetup(moment);

const initialState = {
  project: {
    projectName: '',
    themeName: '',
    content: [{
      mediaSrc: '',
      mediaName: '',
      duration: '',
      startTime: 0,
      endTime: '',
      screens: [{
        screenSrc: '',
        time: '',
        comment: {
          text: '',
          time: '',
          createdAt: ''
        }
      }]
    }],
    styleInspiration: {
      link: '',
      platform: '',
      linkToUserPost: '',
      linkToExternalPost: '',
      author: {}
    }
  },
  projects: [],
  currentProject: {},
  loading: false
};

const projectReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case 'CREATE_PROJECT':
      localStorage.currentProjectId = payload.project._id;
      localStorage.currentMedia = payload.currentMedia;
      localStorage.removeItem('comments')
      return {
        ...state,
        project: {
          ...state.project,
          ...payload.project
        }
      }
    case 'ADD_PROJECT':
      localStorage.currentMedia = payload.currentMedia;
      return {
        ...state,
        project: {
          ...state.project,
          ...payload.project
        }
      }
    case 'GET_PROJECT':
      if (!localStorage.currentMedia) {
        localStorage.currentMedia = payload.project.content[0]._id
      }
      return {
        ...state,
        project: {
          ...state.project,
          ...payload.project
        }
      }
    case 'TAKE_SCREENSHOTS':
    case 'UPDATE_PROJECT':
    case 'DELETE_VIDEO':
      return {
        ...state,
        project: {
          ...state.project,
          ...payload.project
        }
      }
    case 'CUT_TEMP_PROJECT': {
      return {
        ...state,
        project: {
          ...state.project,
          content: payload.project.content
        }
      }
    }
    case "GET_CURRENT_PROJECT":
      localStorage.currentPublishedMedia = payload.project.content[0]._id;
      let newContent = payload.project.content.map(cont => {
        return {
          ...cont,
          screens: cont.screens.sort((a,b) => {
            return moment.duration(a.time).asSeconds() - moment.duration(b.time).asSeconds()
          })
        }
      })
      return {
        ...state,
        project: {},
        currentProject: {
          ...payload.project,
          content: newContent
        }
      }
    case 'CLEAR_TEMP_PROJECT': {
      return {
        ...state,
        project: {}
      }
    }
    case 'GET_PROJECTS': {
      return {
        ...state,
        projects: payload.projects,
        project: {}
      }
    }
    case 'CREATE_FULL_PROJECT':
      return {
        ...state,
        project: {}
      }
    case 'TAKE_SCREENSHOT_ERROR':
    case 'CREATE_FULL_PROJECT_ERROR':
    case 'ADD_PROJECT_ERROR':
    case 'UPDATE_PROJECT_ERROR':
    case 'DELETE_VIDEO_ERROR':
      return {
        ...state,
        project: {
          ...state.project
        }
      }
    case 'CREATE_PROJECT_ERROR':
    case 'GET_PROJECT_ERROR':
      localStorage.removeItem('duration');
      localStorage.removeItem('comments');
      return {
        ...state,
        project: {}
      }
    default: return state
  }
}

export default projectReducer;