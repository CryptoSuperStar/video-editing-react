import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import {connect} from "react-redux";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import './App.css';
import Landing from "./components/Landing/Landing";
import Header from "./components/Header/Header";
import SideHiddenMenu from "./components/SideHiddenMenu/SideHiddenMenu";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import PrivateRoute from "./routes/PrivateRoute";
import UploadMedia from "./components/UploadMedia/UploadMedia";
import Accounts from "./components/Accounts/Accounts";
import Projects from "./components/Projects/Projects";
import Settings from "./components/Settings/Settings";
import {authUser} from "./store/actions/auth.action";
import GoogleCallback from "./components/GoogleCallback/GoogleCallback";
import Policy from "./components/Policy/Policy";
import Support from "./components/Support/Support";

function App(props) {
  
  const [showSideHiddenMenu, setShowSideHiddenMenu] = useState(false);
  
  const handleShowMenu = status => setShowSideHiddenMenu(status);
  const handle = useFullScreenHandle();
  
  useEffect(() => {
    props.dispatch(authUser());
  },[]);
  
  return (
    <Router>
      <div onDoubleClick={handle.enter}>
        <FullScreen handle={handle}>
        <Header handleShowMenu={handleShowMenu} showMenu={showSideHiddenMenu}/>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
        />
        <SideHiddenMenu handleShowMenu={handleShowMenu} showMenu={showSideHiddenMenu}/>
        <Switch>
          <Route exact path="/" component={Landing}/>
          <Route exact path="/sign_in" component={LoginRegister}/>
          <Route exact path="/sign_up" component={LoginRegister}/>
          <PrivateRoute exact path="/term_conds_policy" component={Policy}/>
          <PrivateRoute exact path="/dashboard/upload" component={UploadMedia}/>
          <PrivateRoute exact path="/dashboard/account" component={Accounts}/>
          <PrivateRoute exact path="/dashboard/projects" component={Projects}/>
          <PrivateRoute exact path="/dashboard/settings" component={Settings}/>
          <PrivateRoute exact path="/dashboard/support" component={Support}/>
          <PrivateRoute exact path="/dashboard/googleCallback" component={GoogleCallback}/>
        </Switch>
        </FullScreen>
      </div>
    </Router>
  );
}

export default connect()(App);
