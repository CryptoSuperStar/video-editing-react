import axios from 'axios';
import {REACT_APP_API_URL} from '../../utils/misc';
import {toast} from "react-toastify";

export const authYouTube = () => async dispatch => {
  try {
    const res = await axios.get(`${REACT_APP_API_URL}/authYouTube`);
    return res.data;
  } catch (e) {
    console.log(e)
  }
}

export const shareYouTube = (data) => async dispatch => {
  try {
    const res = await axios.post(`${REACT_APP_API_URL}/uploadToYouTube`, data)
    return res.data;
  } catch (e) {
    console.log(e)
  }
}