import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {updateUser} from "../../store/actions/auth.action";
import penDot from '../../assets/img/penDot.png';
import './UpdateUserModal.scss';
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {ReactComponent as ArrowLeft} from "../../assets/img/arrow-left.svg";

const UpdateUserModal = (props) => {
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  
  useEffect(() => {
    setFirstName(props.user.firstName);
    setLastName(props.user.lastName);
    setEmail(props.user.email);
    setPhone(props.user.phone);
    setCompany(props.user.organisation)
  },[])
  
  const handleSubmit = (e) => {
    e.preventDefault();
    let updatedUser = {...props.user, email, phone, firstName, lastName, organisation: company};
    props.dispatch(updateUser(props.user._id, updatedUser, props.setShowUpdateModal))
  }
  
  return (
    <div className="updateUserModal modal__wrapper">
      <div className="pay__wall--modal">
        <div className="connectSocial__cross" onClick={() => props.setShowUpdateModal(false)}>
          <Cancel fill="black" className="connectSocial__cross--cancel"/>
          <ArrowLeft className="connectSocial__cross--arrowLeft"/>
        </div>
        <h3>Update Profile</h3>
        <p>Lorem ipsum dolor sit amet</p>
        <form className="pay__modal--form" onSubmit={handleSubmit}>
          <div style={{display: 'flex'}}>
            <label className="pay__form--firstName">
              <span>First Name</span>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required/>
              <img src={penDot} alt="pen"/>
            </label>
            <label className="pay__form--lastName">
              <span>Last Name</span>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required/>
              <img src={penDot} alt="pen"/>
            </label></div>
          <label className="pay__form--creditCard">
            <span>Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required/>
            <img src={penDot} alt="pen"/>
          </label>
          <label className="pay__form--creditCard">
            <span>Phone (optional)</span>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)}/>
            <img src={penDot} alt="pen"/>
          </label>
          <label className="pay__form--creditCard">
            <span>Organization</span>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} required/>
            <img src={penDot} alt="pen"/>
          </label>
          <button className="pay__modal--submit" type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default connect()(UpdateUserModal);
