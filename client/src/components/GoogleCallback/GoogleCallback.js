import React, {useEffect} from 'react';
import {useLocation, useHistory} from "react-router-dom";
import { connect } from "react-redux";
import {shareYouTube} from "../../store/actions/share.action";
import { toast } from "react-toastify";
const GoogleCallback = (props) => {
  
  const history = useHistory();
  const search = useLocation().search;
  const code = new URLSearchParams(search).get('code');
  
  useEffect(() => {
    if (code && localStorage.bucket && localStorage.userID ) {
      const {path, name, thumbnail} = localStorage;
      const userId = localStorage.userID;
      const bucket = localStorage.bucket;
      const data = {
        path,
        name,
        thumbnail,
        accessToken: localStorage.accessToken,
        googleId: localStorage.googleId,
        code , 
        userId,
        bucket

      }
      props.dispatch(shareYouTube(data)).then((res) => {
        toast.success(`Video ${res.result.data.status.uploadStatus} on ${res.result.data.snippet.channelTitle} Channel`);
        history.push('/dashboard/upload')
      })
    }
  }, [code,localStorage.bucket,localStorage.userID])
  
  return (
    <div style={{width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center'}}>
      <h3 style={{position: ''}}>The Video is uploading to YouTube</h3>
    </div>
  );
};



export default connect()(GoogleCallback);
