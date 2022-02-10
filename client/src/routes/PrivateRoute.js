import React, {useEffect, useRef} from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
import {connect} from "react-redux";
import DashboardSideNav from "../components/DashboardSideNav/DashboardSideNav";
import supportMockPage from "../../src/assets/img/support-mock.png";
import accountMockPage from "../../src/assets/img/accounts-mock.png";
import projectMockPage from "../../src/assets/img/projects-mock.png";

const PrivateRoute = ({ component: Component, dispatch, user, location, ...rest }) => {
  const modalBlockedRoutes = {
    support: supportMockPage,
    account: accountMockPage,
    projects: projectMockPage
  }
  
  let content = useRef(null);
  const history = useHistory();
  console.log(location)
  
  useEffect(() => {
    if (localStorage.isAuthenticated === 'false') {
      history.push('/')
    }
  },[location.pathname]);
  
  useEffect(() => {
    localStorage.contentWidth = content.current.offsetWidth ? content.current.offsetWidth : 0;
  }, [content.current]);
  
  const shouldShowPayModal = (user) => {
    if (user.userRole === "editor" && !user.payments.length) return true;
    if (user.userRole === "customer" && !user.isPromoCodeVerified) {
      return true;
    }
    return false;
  };

  const renderedContent = (user) => {
    const path = location.pathname.replace("/dashboard/", "");
    if (shouldShowPayModal(user) && modalBlockedRoutes[path]) {
      return (
        <div className='page__img__div'>
          <img src={modalBlockedRoutes[path]} alt={path} />
        </div>
      );
    }
    return (
      <Route
        {...rest}
        render={(props) => <Component {...props} user={user} />}
      />
    );
  };
  return (
    <div className="private__inner" style={{backgroundColor: "#F4F7FCFF"}}>
      <div className="container dashboard">
        <DashboardSideNav/>
        <div className="dashboard__content" ref={content}>
          {localStorage.isAuthenticated === 'true'
            ? renderedContent(user)
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
