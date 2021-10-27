import React from 'react';
import {connect} from "react-redux";
import "./Accounts.scss";

const Accounts = ({user}) => {
  return (
    <div className="Accounts">
      <h3>Accounts</h3>
      {localStorage.isAuthenticated === "true" &&
      <div className="Accounts__info">
        {user.email &&
        <div>
          <strong>Email: </strong>
          <span>{user.email}</span>
        </div>}
        {user.userName &&
        <div>
          <strong>User Name: </strong>
          <span>{user.userName}</span>
        </div>}
        {user.firstName &&
        <div>
          <strong>First Name: </strong>
          <span>{user.firstName}</span>
        </div>}
        {user.lastName &&
        <div>
          <strong>Last Name: </strong>
          <span>{user.lastName}</span>
        </div>}
        {user.userName &&
        <div style={{display: 'flex', alignItems: 'center'}}>
          <strong>Avatar: </strong>
          <img src={user.avatar} alt="avatar"/>
        </div>}
        {user.registeredWith &&
        <div>
          <strong>Registered via: </strong>
          <span>{user.registeredWith}</span>
        </div>}
        <div className="plan">
          <h5>Plan: </h5>
          {user.plan.title &&
          <div>
            <strong>Plan name: </strong>
            <span>{user.plan.title}</span>
          </div>}
          {user.plan.price &&
          <div>
            <strong>Cost: </strong>
            <span>${user.plan.price}/month</span>
          </div>}
          {user.plan.totalCost &&
          <div>
            <strong>Total Cost: </strong>
            <span>${user.plan.totalCost}</span>
          </div>}
          {user.plan.paidWith &&
          <div>
            <strong>Paid with: </strong>
            <span>{user.plan.paidWith}</span>
          </div>}
          {user.plan.paidDate &&
          <div>
            <strong>Paid Date: </strong>
            <span>{user.plan.paidDate}</span>
          </div>}
          {user.plan.paidExpiresDate &&
          <div>
            <strong>Paid Expire Date: </strong>
            <span>{user.plan.paidExpiresDate}</span>
          </div>}
          {user.paymentId &&
          <div>
            <strong>Your Pay Order ID: </strong>
            <span>{user.paymentId}</span>
          </div>}
        </div>
        {/*<div className="connected_socials">
          <h5>Connected social networks</h5>
          {user.socialLinks.instagramLink &&
          <div>
            <strong>YouTube: </strong>
            <span>{user.socialLinks.instagramLink}</span>
          </div>}
          {user.socialLinks.youTubeLink &&
          <div style={{overflow: 'hidden'}}>
            <strong>YouTube: </strong>
            <span>Yes</span>
          </div>}
        </div>*/}
      </div>
      }
    </div>
  );
}

const mapStateToProps = state => ({
    user: state.auth.user
  }
)

export default connect(mapStateToProps)(Accounts);
