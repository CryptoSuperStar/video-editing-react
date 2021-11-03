import React, {useState, useEffect, Fragment} from 'react';
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import MoonLoader from "react-spinners/MoonLoader";
import './Header.scss';
import logo from '../../assets/img/logo.png';
import {ReactComponent as HamburgerMenu} from "../../assets/img/icons8-menu.svg";
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {ReactComponent as Plus} from "../../assets/img/add.svg";
import {ReactComponent as Bell} from "../../assets/img/bell_icon.svg";
import {ReactComponent as Search} from "../../assets/img/search_icon.svg";
import avatar from "../../assets/img/bitmap-10@1x.png"

const Header = (props) => {
  
  const [isDashboard, setIsDashboard] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState(null);
  
  useEffect(() => {
     if (localStorage.isAuthenticated === 'true' && localStorage.token) {
       setIsDashboard(true);
     } else setIsDashboard(false)
  }, [localStorage.isAuthenticated])
  
  useEffect(() => {
    setLoading(props.loading)
  },[])
  
  useEffect(() => {
    if (props.user.firstName) {
      setFullName(`${props.user.firstName} ${props.user.lastName ? props.user.lastName : ''}`)
    } else if (props.user.userName) {
      setFullName(props.user.userName)
    } else setFullName(props.user.email);
  }, [props.user])
  
  const dashboardMenu = (
    <div className="dashboard__menu--block">
      {loading ? <MoonLoader /> :
      <Fragment>
        <Link to="/dashboard/upload" className="menu__upload--button">
          <Plus />
          <span >Upload</span>
        </Link>
        <Bell />
        <div className="menu__user">
          <img src={props.user ? props.user.avatar : avatar} alt="avatar"/>
          <span className="menu__user--name"
                onClick={() => props.history.push('/dashboard/account')}
          >{props.user && fullName} </span>
          <button type="button" onClick={() => {
            localStorage.removeItem('token');
            props.dispatch({type: 'LOGOUT'});
            setIsDashboard(false);
            props.history.push('/');
          }}>Logout</button>
        </div>
      </Fragment>}
    </div>
  )
  
  return (
    <div className="Header__block container" style={{zIndex: localStorage.showDemoLayer === 'true' && '100'}}>
      <Link className="logo__block" to="/">
        <img src={logo} alt="logo"/>
        <span className="logo__title">ProVid.</span>
      </Link>
      {isDashboard &&
      <div className="search__bar">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}/>
        <Search />
      </div>}
      {props.showMenu
        ? <Cancel className="cancelMenu mobile__view" onClick={() => props.handleShowMenu(false)}/>
        : <HamburgerMenu className="hamburgerMenu mobile__view" onClick={() => props.handleShowMenu(true)}/>}
      {isDashboard
      ? dashboardMenu
      : <div className="menu__block web__view">
          <Link to="*">Demo</Link>
          <Link to="*">Pages</Link>
          <Link to="*">Support</Link>
          <Link to="/sign_in">Login</Link>
          <Link to="/sign_up" className="getStarted__btn">Get Started</Link>
      </div>}
    </div>
  );
}

const mapStateToProps = state => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading
  }
)

export default connect(mapStateToProps)(withRouter(Header));
