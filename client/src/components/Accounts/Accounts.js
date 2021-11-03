import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {updateUser} from "../../store/actions/auth.action";
import MoonLoader from "react-spinners/MoonLoader";
import penDot from '../../assets/img/penDot.png';
import visa from '../../assets/img/visa-150x150.png';
import master from '../../assets/img/mastercard1.png';
import visaMaster from '../../assets/img/visa-master.png';
import paypal from '../../assets/img/paypal.jpeg';
import apple from '../../assets/img/apple-pay.svg';
import star from '../../assets/img/star.png';

import "./Accounts.scss";
import UpdateUserModal from "../Modals/UpdateUserModal";
import moment from "moment";
import {Elements} from "@stripe/react-stripe-js";
import PayWallModal from "../Modals/PayWallModal";
import {loadStripe} from "@stripe/stripe-js";
import {REACT_APP_STRIPE_API} from "../../utils/misc";
import UpdateAddPayment from "../Modals/UpdateAddPayment";
import ResetPasswordModal from "../Modals/ResetPasswordModal";
import ShareLinkModal from "../Modals/ShareLinkModal";
const stripePromise = loadStripe(REACT_APP_STRIPE_API);

const Accounts = (props) => {
  
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showUpdateAddPayModal, setUpdateAddPayModal] = useState(false);
  const [showResetPassModal, setResetPassModal] = useState(false);
  const [showShareModal, setShareModal] = useState(false);
  const [type, setType] = useState('');
  const [payId, setPayId] = useState('');
  const [fullName, setFullName] = useState(null);
  
  useEffect(() => {
    if (props.user._id) {
      setUserInfo(props.user);
      setLoading(false)
    }
  },[props.user._id, props.user])
  
  useEffect(() => {
    if (userInfo) {
      if (userInfo.firstName) {
        setFullName(`${userInfo.firstName} ${userInfo.lastName ? userInfo.lastName : ''}`)
      } else setFullName(props.user.userName)
    }
  }, [userInfo])
  
  const cancelSubscribe = (id) => {
    const updatedPayments = userInfo.payments.filter(pay => pay._id !== id);
    const updatedUser = {...userInfo, payments: updatedPayments};
    setUserInfo(updatedUser);
    props.dispatch(updateUser(userInfo._id, updatedUser, () => console.log('Deleted')))
  }
  
  if(loading) return <div className="spinner__wrapper">
    <MoonLoader className="spinner" color="#000" loading={loading} size={50}/>
  </div>
  return (
    <div className="Account">
  
      {showResetPassModal && <ResetPasswordModal setShowUpdateModal={setResetPassModal} user={userInfo}/>}
      {showUpdateModal && <UpdateUserModal user={userInfo} setShowUpdateModal={setShowUpdateModal}/>}
      {showShareModal && <ShareLinkModal setShowUpdateModal={setShareModal}/>}
      {showPayModal &&
      <Elements stripe={stripePromise}>
        <PayWallModal setShowPayWall={setShowPayModal} user={userInfo}/>
      </Elements>}
      {showUpdateAddPayModal &&
      <Elements stripe={stripePromise}>
        <UpdateAddPayment
          setShowPayWall={setUpdateAddPayModal}
          user={userInfo}
          type={type}
          payId={payId}
        /></Elements>}
      <h3>Account</h3>
      {userInfo &&
      <>
        <section>
          <div className="Account__header">
            <h3>Information </h3>
            <button onClick={() => setShowUpdateModal(true)}>
              <img src={penDot} alt="pen"/>
              <span>Update</span>
            </button>
          </div>
          <div className="account_line"/>
          <div className="user_info">
            <img src={userInfo.avatar} alt="avatar"/>
            <div>
              <span>{fullName}</span>
              <span>{userInfo.email}</span>
            </div>
          </div>
          <div className="account_line"/>
          <div className="organisation">
            <h5>Organisation</h5>
            <span>{userInfo.organisation ? userInfo.organisation : '---'}</span>
          </div>
        </section>
        
        <section>
          <div className="billing__header">
            <h3>Billing</h3>
            <button>
              {userInfo.payments.length > 0
                ? <span onClick={() => {
                  setUpdateAddPayModal(true);
                  setType('add')
                  }
                }>+ add a card</span>
                : <span onClick={() => setShowPayModal(true)}>pay now</span>}
            </button>
          </div>
          <div className="account_line"/>
          
          {userInfo.payments.length > 0 ? userInfo.payments.map(pay => (
            <div className="billing__info" key={pay._id}>
              <div className="billing__accounts">
                <div className="billing__plan">
                  <div>
                  <span className="billing__plan--title">
                    {pay.plan.title}
                    <img src={star} alt="star"/>
                  </span>
                    <span className='billing__plan--exp'>Experienced on {pay.plan.paidExpiresDate}</span>
                  </div>
                  <button className="cancelPlan"
                          onClick={() => cancelSubscribe(pay._id)}
                  >Cancel Subscription</button>
                </div>
                <div className="card__info">
                  <img src={
                    pay.paidBy === "paypal"
                      ? paypal
                      : pay.paidBy === "mastercard"
                        ? master
                        : pay.paidBy === "visa"
                          ? visa
                          : pay.paidBy === "apple_pay"
                            ? apple : visaMaster
                  } alt="payment__image"/>
                  <div className="payment__detail">
                    <span>{pay.paidBy} **** **** **** {pay.cardNumberLast4str}</span>
                    <span>{pay.holder}</span>
                  </div>
                </div>
              </div>
    
              <button onClick={() => {
                setUpdateAddPayModal(true);
                setType('update')
                setPayId(pay._id)
              }
              }>
                <img src={penDot} alt="pen"/>
                <span>Update</span>
              </button>
            </div>
          )):
            <div className="billing__info">
              <div className="billing__accounts">
                <div className="billing__plan">
                  <div>
                  <span className="billing__plan--title">
                    Trial
                  </span>
                    <span className='billing__plan--exp'>Experienced on {moment(userInfo.createdAt).add(1, 'w').format('MMMM Do YYYY')}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </section>
        
        <section>
          <div className="general__header">
            <h3>General</h3>
          </div>
          <div className="account_line"/>
          <div className="general__buttons">
            <button onClick={() => setResetPassModal(true)}>Reset Password</button>
            {/*<button onClick={() => setShareModal(true)}>Invite Friends</button>*/}
            <button onClick={() => {
              localStorage.removeItem('token');
              props.dispatch({type: 'LOGOUT'});
              props.history.push('/');
            }}>Log Out</button>
            <button onClick={() => props.history.push('/term_conds_policy')}>Policy</button>
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
