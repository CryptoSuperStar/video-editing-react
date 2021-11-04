import React from 'react';
import './SideHiddenMenu.scss';
import {ReactComponent as RightArrow} from "../../assets/img/next.svg";
import { withRouter, useHistory } from 'react-router-dom';
import {connect} from "react-redux";

const SideHiddenMenu = (props) => {
  
  const history = useHistory();
  
  const unregisteredLinks = ["Account", 'Upload', "Projects", "Support"]
  
  const handleButton = link => {
    props.handleShowMenu(false);
    props.history.push(`/${link}`);
  }
  
  return (
    <div className="SideHiddenMenu mobile__view" style={{left: props.showMenu ? 0 : -window.innerWidth - 60 + "px"}}>
      <div className="SideHiddenMenu__login">
        <span>Join the Pro leagues with ProVid</span>
        {(localStorage.isAuthenticated === "false" || !localStorage.token) && <div className="SideHiddenMenu__links">
          <button className="SideHiddenMenu__link--register" onClick={() => handleButton("sign_up")}>Sign Up</button>
          <button className="SideHiddenMenu__link--login" onClick={() => handleButton("sign_in")}>Sign In</button>
        </div>}
        
        <ul className="SideHiddenMenu__links--unregistered">
          {localStorage.isAuthenticated === "true" && localStorage.token &&
          <>
            <li>
              <button onClick={() => history.push('/dashboard/settings')}>
                <span className="menu__user--name">{props.user && (props.user.userName || props.user.email)} </span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => {
                localStorage.removeItem('token');
                props.dispatch({type: 'LOGOUT'});
                props.history.push('/');
              }}>Logout</button>
            </li>
          </>
          }
          
          {unregisteredLinks.map((link, i) => (
            <li key={i}>
              <button onClick={() => handleButton( 'dashboard/' + link.toLowerCase())}>
                {link}<RightArrow />
              </button>
            </li>
          ))}
          {/*<li>
            <button onClick={() => handleButton( 'term_conds_policy')}>
              Policy<RightArrow />
            </button>
          </li>*/}
        </ul>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user
})

export default connect(mapStateToProps)(withRouter(SideHiddenMenu));
