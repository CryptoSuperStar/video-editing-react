import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import MoonLoader from "react-spinners/MoonLoader";
import penDot from '../../assets/img/penDot.png';
import visa from '../../assets/img/visa-150x150.png';
import master from '../../assets/img/mastercard1.png';
import visaMaster from '../../assets/img/visa-master.png';
import paypal from '../../assets/img/paypal.jpeg';
import apple from '../../assets/img/apple-pay.svg';

import star from '../../assets/img/star.png';

import "./Accounts.scss";

const Accounts = ({user}) => {
  
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user._id) {
      setUserInfo(user);
      setLoading(false)
    }
  },[user._id])
  
  console.log(userInfo)
  
  if(loading) return <div className="spinner__wrapper">
    <MoonLoader className="spinner" color="#000" loading={loading} size={50}/>
  </div>
  return (
    <div className="Account">
      <h3>Account</h3>
      {userInfo &&
      <>
        <section>
          <div className="Account__header">
            <h3>Information</h3>
            <button>
              <img src={penDot} alt="pen"/>
              <span>Update</span>
            </button>
          </div>
          <div className="account_line"/>
          <div className="user_info">
            <img src={userInfo.avatar} alt="avatar"/>
            <div>
              <span>{userInfo.userName}</span>
              <span>{userInfo.email}</span>
            </div>
          </div>
          <div className="account_line"/>
          <div className="organisation">
            <h5>Organisation</h5>
            <span>{userInfo.organization ? userInfo.organization : 'Provide LLC'}</span>
          </div>
        </section>
        
        <section>
          <div className="billing__header">
            <h3>Billing</h3>
            <button><span>+ add a card</span></button>
          </div>
          <div className="account_line"/>
          {userInfo.plan && <div className="billing__info">
            <div className="billing__accounts">
              <div className="billing__plan">
                <div>
                  <span className="billing__plan--title">
                    {userInfo.plan.title}
                    <img src={star} alt="star"/>
                  </span>
                  <span className='billing__plan--exp'>Experienced on {userInfo.plan.paidExpiresDate}</span>
                </div>
                <button className="cancelPlan">Cancel Subscription</button>
              </div>
              <div className="card__info">
                <img src={
                  userInfo.plan.paidWith === "paypal"
                    ? paypal
                    : userInfo.plan.paidWith === "mastercard"
                      ? master
                      : userInfo.plan.paidWith === "visa"
                        ? visa
                        : userInfo.plan.paidWith === "apple_pay"
                          ? apple : visaMaster
                } alt="payment__image"/>
                <div className="payment__detail">
                  <span>{userInfo.plan.paidWith}</span>
                  <span>{userInfo.userName}</span>
                </div>
              </div>
            </div>
    
            <button>
              <img src={penDot} alt="pen"/>
              <span>Update</span>
            </button>
          </div>}
        </section>
        
        <section>
          <div className="general__header">
            <h3>General</h3>
          </div>
          <div className="account_line"/>
          <div className="general__buttons">
            <button>Reset Password</button>
            <button>Invite Friends</button>
            <button>Log Out</button>
          </div>
        </section>
      </>
      }
    </div>
  );
}

const mapStateToProps = state => ({
    user: state.auth.user
  }
)

export default connect(mapStateToProps)(Accounts);
