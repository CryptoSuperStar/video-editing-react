import React, { useState } from 'react';
import {connect} from "react-redux";
import {resetPassword} from "../../store/actions/auth.action";
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {ReactComponent as ArrowLeft} from "../../assets/img/arrow-left.svg";

const ResetPasswordModal = (props) => {
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMatch, setIsMatch] = useState(true);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isMatch) return false;
    props.dispatch(resetPassword(oldPassword,newPassword, props.setShowUpdateModal))
  }
  
  return (
    <div className="ResetPasswordModal modal__wrapper">
      <div className="pay__wall--modal">
        <div className="connectSocial__cross" onClick={() => props.setShowUpdateModal(false)}>
          <Cancel fill="black" className="connectSocial__cross--cancel"/>
          <ArrowLeft className="connectSocial__cross--arrowLeft"/>
        </div>
        <h3>Reset Password</h3>
        <p>Lorem ipsum dolor sit amet</p>
        {props.user.registeredWith === 'SSO' ?
          <form className="pay__modal--form" onSubmit={handleSubmit}>
            <label className="pay__form--creditCard">
              <span>Old Password</span>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required minLength={8}/>
            </label>
            <label className="pay__form--creditCard">
              <span>New Password</span>
              <input type="password" value={newPassword} onChange={e => {
                setNewPassword(e.target.value);
                (confirmPassword.length >= 8 && e.target.value !== confirmPassword) && setIsMatch(false);
                (confirmPassword.length >= 8 && e.target.value === confirmPassword) && setIsMatch(true);
              }} required minLength={8}/>
            </label>
            <label className="pay__form--creditCard">
              <span>Confirm New Password</span>
              <input type="password" value={confirmPassword} onChange={e => {
                setConfirmPassword(e.target.value);
                newPassword !== e.target.value && setIsMatch(false);
                newPassword === e.target.value && setIsMatch(true);
              }}
                     required minLength={8}
                     style={{outline: !isMatch && '1px solid red'}}
              />
            </label>
            {!isMatch && <div className="error" style={{color: 'red',marginTop: '15px'}}>Confirm Password not match.</div>}
            <button className="pay__modal--submit" type="submit">Change</button>
          </form>
          : <div style={{color: 'green' ,margin: '40px'}}>
            <div>No password.</div>
            <div>You are registered by {props.user.registeredWith}</div>
          </div>}
        
      </div>
    </div>
  );
};

export default connect()(ResetPasswordModal);
