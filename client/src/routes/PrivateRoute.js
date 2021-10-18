import React, {useEffect, useRef} from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
import {connect} from "react-redux";
import DashboardSideNav from "../components/DashboardSideNav/DashboardSideNav";

const PrivateRoute = ({ component: Component, dispatch, user, location, ...rest }) => {
  
  let content = useRef(null);
  const history = useHistory();
  
  useEffect(() => {
    if (localStorage.isAuthenticated === 'false') {
      history.push('/')
    }
  },[location.pathname]);
  
  useEffect(() => {
    localStorage.contentWidth = content.current.offsetWidth ? content.current.offsetWidth : 0;
  }, [content.current]);
  
  
  return (
    <div className="private__inner" style={{backgroundColor: "#F4F7FCFF"}}>
      <div className="container dashboard">
        <DashboardSideNav/>
        <div className="dashboard__content" ref={content}>
          {localStorage.isAuthenticated === 'true'
            ? <Route
              {...rest}
              render={props => <Component {...props} user={user}/>}/>
            : <Redirect to="/"/>
          }
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  user: state.auth.user
})

export default connect(mapStateToProps)(PrivateRoute);
