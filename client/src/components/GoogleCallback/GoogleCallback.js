import React, {useEffect} from 'react';
import {useLocation, useHistory} from "react-router-dom";
import { connect } from "react-redux";
import {shareYouTube} from "../../store/actions/share.action";

const GoogleCallback = (props) => {
  
  const history = useHistory();
  const search = useLocation().search;
  const code = new URLSearchParams(search).get('code');
  
  useEffect(() => {
    if (code) {
      const {path, name, thumbnail} = localStorage;
      const data = {
        path,
        name,
        thumbnail,
        accessToken: localStorage.accessToken,
        googleId: localStorage.googleId,
        code
      }
      props.dispatch(shareYouTube(data)).then(() => {
        history.push('/dashboard/upload')
      })
    }
  }, [code])
  
  return (
    <div style={{width: '100%', height: '100%', display: 'flex',
    alignItems: 'center', justifyContent: 'center'}}>
      <h3 style={{position: ''}}>The Video is uploading to YouTube</h3>
    </div>
  );
};

export default connect()(GoogleCallback);
