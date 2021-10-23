import axios from 'axios';
import { REACT_APP_API_URL } from '../../utils/misc';
import { toast } from "react-toastify";
import setAuthToken from '../../utils/authToken';

export const createTempProject = (link, bucket, setLoadingVideo) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/createTempProject`, { link, bucket });
      dispatch({
        type: "CREATE_PROJECT",
        payload: res.data
      })
      setLoadingVideo(false);
      toast.success('The file was uploaded')
      return res.data;
    } catch (e) {
      dispatch({
        type: "CREATE_PROJECT_ERROR"
      })
      setLoadingVideo(false)
      console.log(e.message);
    }
  }
}

export const takeScreenshots = (id, bucket, link, name, setLoadingSlider) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/takeScreenshot`, { id, bucket, link, name });
      dispatch({
        type: 'TAKE_SCREENSHOTS',
        payload: res.data
      })
      setLoadingSlider(false)
      toast.success('Images were generated.')
    } catch (e) {
      dispatch({
        type: 'TAKE_SCREENSHOTS_ERROR'
      })
      setLoadingSlider(false)
      console.log(e.message);
    }
  }
}

export const clearTempProject = (id, bucket) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    localStorage.removeItem('duration');
    localStorage.removeItem('currentProjectId');
    localStorage.removeItem('currentMedia');
    try {
      await axios.get(`${REACT_APP_API_URL}/clearTempProject/${id}/${bucket}`);
      dispatch({
        type: "CLEAR_TEMP_PROJECT"
      })
      toast.success('Project was deleted.');
      return true;
    } catch (e) {
      dispatch({
        type: "CLEAR_TEMP_PROJECT_ERROR"
      })
      console.log(e.message);
    }
  }
}

export const cutTempProject = (data, setLoading, setLoadingSlider) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/cutTempProject`, data);
      dispatch({
        type: "CUT_TEMP_PROJECT",
        payload: res.data
      });
      setLoading(false);
      toast.success('The video was cut')
      localStorage.removeItem('comments');
      setLoadingSlider(true);
      let currProject = res.data.project.content.filter(item => item._id === localStorage.currentMedia)[0];
      dispatch(takeScreenshots(
        res.data.project._id,
        currProject.mediaSrc,
        currProject.mediaName,
        setLoadingSlider
      ))
    } catch (e) {
      dispatch({
        type: "CUT_TEMP_PROJECT_ERROR"
      })
      console.log(e.message);
      setLoading(false)
    }
  }
};

export const createProjectMedia = (project, history, setLoading) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    let config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/createProject`, { project }, config);
      dispatch({
        type: "CREATE_FULL_PROJECT"
      })
      toast.success("Project was created");
      setLoading(false)
      localStorage.removeItem('duration');
      localStorage.removeItem('comments');
      localStorage.removeItem('imageComments');
      localStorage.removeItem('currentProjectId');
      localStorage.removeItem('updateComment');
      localStorage.removeItem('editedVideoTime');
      localStorage.removeItem('currentMedia');
      history.push('/dashboard/projects');
    } catch (e) {
      dispatch({
        type: 'CREATE_FULL_PROJECT_ERROR'
      })
      setLoading(false);
      console.log(e.message);
    }
  }
}

export const updateProjectMedia = (projectId, data, func) => async dispatch => {
  try {
    func(false);
    toast.success('Style inspiration was added');
  } catch (e) {
    dispatch({
      type: 'UPDATE_PROJECT_ERROR'
    });
    console.log(e.message);
  }
}

export const getProjects = (setLoading) => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const res = await axios.get(`${REACT_APP_API_URL}/getProjects`);
      dispatch({
        type: 'GET_PROJECTS',
        payload: res.data
      })
      setLoading(false);
    } catch (e) {
      dispatch({
        type: 'GET_PROJECTS_ERROR'
      })
      console.log(e.message);
    }
  }
}

export const getProject = (id, setLoading) => async dispatch => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/getProject/${id}`);
    dispatch({
      type: 'GET_PROJECT',
      payload: res.data
    })
    setLoading(false);
  } catch (e) {
    dispatch({
      type: 'GET_PROJECT_ERROR'
    })
    setLoading(false);
    console.log(e.message);
  }
}

export const getCurrentProject = (id, setLoading) => async dispatch => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/getProject/${id}`);
    dispatch({
      type: 'GET_CURRENT_PROJECT',
      payload: res.data
    })
    localStorage.removeItem('comments')
    setLoading(false);
  } catch (e) {
    dispatch({
      type: 'GET_CURRENT_PROJECT_ERROR'
    })
    setLoading(false);
    console.log(e.message);
  }
}

export const addMediaToProject = (link, projectId, bucket, setLoadingVideo) => async dispatch => {
  try {
    const res = await axios.put(`${REACT_APP_API_URL}/addMedia`, { projectId, link, bucket });
    dispatch({
      type: "ADD_PROJECT",
      payload: res.data
    })
    localStorage.removeItem('comments')
    setLoadingVideo(false);
    toast.success('The file was added')
    return res.data;

  } catch (e) {
    dispatch({
      type: "ADD_PROJECT_ERROR"
    })
    setLoadingVideo(false)
    console.log(e.message);
  }
}

export const updateContent = (content) => async dispatch => {
  try {
    const res = await axios.put(`${REACT_APP_API_URL}/updateComments/${localStorage.currentProjectId}`,
      { content });
    dispatch({
      type: "UPDATE_PROJECT",
      payload: res.data
    })
    localStorage.removeItem('comments');
    localStorage.removeItem('updateComment');
    localStorage.removeItem('editedVideoTime')
  } catch (e) {
    dispatch({
      type: "UPDATE_PROJECT_ERROR"
    })
    console.log(e.message);
  }
}

export const deleteVideo = (newContent, videoInfo, bucket) => async dispatch => {
  try {
    const res = await axios.put(`${REACT_APP_API_URL}/deleteVideo/${localStorage.currentProjectId}`,
      { newContent, videoInfo, bucket });
    dispatch({
      type: "DELETE_VIDEO",
      payload: res.data
    })
    toast.success('Video was deleted');
    return res;
  } catch (e) {
    dispatch({
      type: "DELETE_VIDEO_ERROR"
    })
    toast.error('Delete the video error.')
    console.log(e.message);
  }
}


