import React, { useState, useEffect, Fragment } from 'react';
import { Link, withRouter, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import MoonLoader from "react-spinners/MoonLoader";
import './Header.scss';
import logo from '../../assets/img/logo-v1.png'
import { ReactComponent as HamburgerMenu } from "../../assets/img/icons8-menu.svg";
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import { ReactComponent as Plus } from "../../assets/img/add.svg";
import { ReactComponent as Bell } from "../../assets/img/bell_icon.svg";
import avatar from "../../assets/img/bitmap-10@1x.png"
import PayAccessModal from "../Modals/PayAccessModal";
import PayWallModal from "../Modals/PayWallModal";
import PromoCodeModal from '../Modals/PromoCodeModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { REACT_APP_STRIPE_API } from "../../utils/misc";
const stripePromise = loadStripe(REACT_APP_STRIPE_API);
const Header = (props) => {
  const history = useHistory();
  const [isDashboard, setIsDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState(null);
  const [showPayAccess, setShowPayAccess] = useState(false);
  const [showPayWall, setShowPayWall] = useState(false);
  const [showPromoCodeWall, setShowPromoCodeWall] = useState(false);
  useEffect(() => {
    if (props.user.userName) {
      (history.location.pathname.includes('dashboard')) &&
        setTimeout(() => {
          if (props.user?.userRole === "editor" && !props.user.payments.length) {
            setShowPayAccess(true)
          }
          else if (props.user?.userRole === "customer" && !props.user?.isPromoCodeVerified) { setShowPromoCodeWall(true) }
        }, 500)
    }
  }, [history?.location?.pathname, props.user?.isPromoCodeVerified, props.user?.payments?.length, props.user.userName, props.user?.userRole]);
  useEffect(() => {
    if (localStorage.isAuthenticated === 'true' && localStorage.token) {
      setIsDashboard(true);
    } else setIsDashboard(false)
  }, [localStorage.isAuthenticated])

  useEffect(() => {
    setLoading(props.loading)
  }, [])

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
          <Link to="/dashboard/upload"
            onClick={() => {
              if (window.location.pathname === "/dashboard/upload") {
                localStorage.removeItem('duration');
                localStorage.removeItem('currentProjectId');
                localStorage.removeItem('currentMedia');
                localStorage.removeItem('comments');
                window.location.reload()
              }

            }}
            
            className="menu__upload--button">
            
            <Plus />
            <span>Create New Project</span>
          </Link>
          <Bell />
          <div className="menu__user">
            <img src={props.user ? props.user.avatar : avatar} alt="avatar" />
            <span className="menu__user--name"
              onClick={() => props.history.push('/dashboard/account')}
            >{props.user && fullName} </span>
            <button type="button" onClick={() => {
              localStorage.removeItem('token');
              props.dispatch({ type: 'LOGOUT' });
              setIsDashboard(false);
              props.history.push('/');
            }}>Logout</button>
          </div>
        </Fragment>}
    </div>
  )

  return (
    <div className="Header__block container">
      {isDashboard && <>
        {showPayAccess && <PayAccessModal setShowPayAccess={setShowPayAccess} setShowPayWall={setShowPayWall} setShowPromoCodeWall={setShowPromoCodeWall} />}
        {showPayWall &&
          <Elements stripe={stripePromise}>
            <PayWallModal setShowPayWall={setShowPayWall} setShowPayAccess={setShowPayAccess} user={props.user} />
          </Elements>}
        {
          showPromoCodeWall && <PromoCodeModal setShowPayAccess={setShowPayAccess} setShowPromoCodeWall={setShowPromoCodeWall} user={props.user} />
        }
      </>}
      <Link className="logo__block" to="/">
        <img src={logo} alt="logo" />
      </Link>
      {props.showMenu
        ? <Cancel className="cancelMenu mobile__view" onClick={() => props.handleShowMenu(false)} />
        : <HamburgerMenu className="hamburgerMenu mobile__view" onClick={() => props.handleShowMenu(true)} />}
      {isDashboard
        ? dashboardMenu
        : <div className="menu__block web__view">
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
