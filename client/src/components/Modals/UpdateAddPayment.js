import React, { useState } from 'react';
import {connect} from "react-redux";
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {ReactComponent as Tick} from "../../assets/img/accept_added_check_complite_yes_icon.svg";
import {CardCvcElement, CardExpiryElement, CardNumberElement, PaymentRequestButtonElement, useElements,
  useStripe} from "@stripe/react-stripe-js";
import PaypalExpressBtn from "react-paypal-express-checkout";
import {toast} from "react-toastify";
import {REACT_APP_PAYPAL_API} from "../../utils/misc";
import {ReactComponent as CreditCard} from "../../assets/img/credit-card.svg";
import {ReactComponent as PayPal} from "../../assets/img/paypal.svg";
import {ReactComponent as ApplePay} from "../../assets/img/apple-pay.svg";
import {ReactComponent as ArrowLeft} from "../../assets/img/arrow-left.svg";
import {updateUser} from "../../store/actions/auth.action";
import './PayWallModal.scss';
import penDot from "../../assets/img/penDot.png";

const UpdateAddPayment = (props) => {
  
  const stripe = useStripe();
  const elements = useElements();
  
  let payment = {
    holder: '',
    cardNumberLast4str: '',
    paidBy: null
  }
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [payments, setPayments] = useState([{
    title: "credit card",
    src: <CreditCard />,
    active: true
  }, {
    title: "paypal",
    src: <PayPal />,
    active: false
  }, {
    title: "apple pay",
    src: <ApplePay />,
    active: false
  }]);
  const [activePayment, setActivePayment] = useState('credit card');
  const [paymentRequest, setPaymentRequest] = useState(null);
  
  let env = 'sandbox';
  let currency = 'USD';
  
  const client = {
    sandbox: REACT_APP_PAYPAL_API,
    production: ''
  };
  
  const changePayment = i => {
    let newPayments = [...payments];
    newPayments.map(pay => pay.active = false);
    newPayments[i].active = true;
    setActivePayment(newPayments[i].title);
    setPayments(newPayments);
  }
  
  const collectPaymentsData = () => {
    let paymentData;
    let newUserInfo;
    if (props.type === 'add') {
      paymentData = {
        ...payment,
        paidBy: payment.paidBy ? payment.paidBy : activePayment,
        holder: `${firstName} ${lastName}`,
        plan: {
          title: 'Additional payment',
          paidExpiresDate: 'not set'
        }
      }
      newUserInfo = {
        ...props.user,
        payments: [...props.user.payments, paymentData]
      }
    }
    if (props.type === 'update') {
      paymentData = {
        ...payment,
        paidBy: payment.paidBy ? payment.paidBy : activePayment,
        holder: `${firstName} ${lastName}`
      }
      let newPayments = props.user.payments.map(pay => pay._id === props.payId
        ? {...paymentData, plan: pay.plan}
        : pay);
      newUserInfo = {
        ...props.user,
        payments: [...newPayments]
      }
    }
    props.dispatch(updateUser(props.user._id, newUserInfo, props.setShowPayWall))
  }
  
  const onSuccess = (payment) => {
    // Congratulation, it came here means everything's fine!
    console.log("The payment was succeeded!", payment);
    if (payment.paid) {
      const [lastName, firstName] = payment.address.recipient_name.split(' ');
      setFirstName(firstName);
      setLastName(lastName);
      collectPaymentsData(payment.paymentID, firstName, lastName)
    }
    // You can bind the "payment" object's value to your state or props or whatever here, please see below for sample returned data
  }
  
  const onCancel = (data) => {
    // User pressed "cancel" or close Paypal's popup!
    console.log('The payment was cancelled!', data);
    toast.warning('The payment was cancelled!')
    // You can bind the "data" object's value to your state or props or whatever here, please see below for sample returned data
  }
  
  const onError = (err) => {
    // The main Paypal's script cannot be loaded or somethings block the loading of that script!
    console.log("Error!", err);
    toast.error('Payment error!', err);
    // Because the Paypal's main script is loaded asynchronously from "https://www.paypalobjects.com/api/checkout.js"
    // => sometimes it may take about 0.5 second for everything to get set, or for the button to appear
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    if (activePayment === 'credit card') {
      //STEP 1:
      //create new payment method based on card and form information
      const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardNumberElement)
      });
      setActivePayment(paymentMethod.card.brand)
      if (error) {
        console.log('[error]', error);
        toast.error(error)
      }
      payment = {...payment, cardNumberLast4str: paymentMethod.card.last4, paidBy: paymentMethod.card.brand};
      collectPaymentsData();
    }
  };
  
  return (
    <div className="modal__wrapper">
      <div className="pay__wall--modal">
        <div className="connectSocial__cross" onClick={() => props.setShowPayWall(false)}>
          <Cancel fill="black" className="connectSocial__cross--cancel"/>
          <ArrowLeft className="connectSocial__cross--arrowLeft"/>
        </div>
        <h3>{props.type === 'update' ? "Update Payment Method" : "Add Payment"}</h3>
        <p>Lorem ipsum dolor sit amet</p>
        <h5>Select Payment Method</h5>
        <div className="modal__payments">
          {payments.map((pay, i) => (
            <div className="modal__payments--item" key={i} style={{
              border: `1px solid ${pay.active ? "#3b8590" : '#36596a55'}`,
              backgroundColor: pay.active ? '#3b85911a' : 'white'
            }}
                 onClick={() => changePayment(i)}
            >
              <div className="modal__plans--tick"
                   style={{backgroundColor: pay.active ? "#3b8590" : "rgba(133,134,149,0.1)"}}>
                {pay.active && <Tick fill="white"/>}
              </div>
              {pay.src}
            </div>
          ))}
        </div>
        <form className="pay__modal--form" onSubmit={handleSubmit}>
          {activePayment === 'credit card'
          && <div className="pay__modal--creditCard">
            <div style={{display: 'flex'}}><label className="pay__form--firstName">
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
              <span>Card Number</span>
              <CardNumberElement id="creditCard__number"/>
              <img src={penDot} alt="pen"/>
            </label>
            <div className="creditCard__last">
              <label>
                <span>Expiry</span>
                <CardExpiryElement id="creditCard__expire"/>
                <img src={penDot} alt="pen"/>
              </label>
              <label>
                <span>CVV</span>
                <CardCvcElement id="creditCard__cvv"/>
                <img src={penDot} alt="pen"/>
              </label>
            </div>
          </div>}
          
          {activePayment === 'paypal'
          && <PaypalExpressBtn
            env={env}
            client={client}
            currency={currency}
            total={0}
            onError={onError}
            onCancel={onCancel}
            onSuccess={onSuccess}
            style={{
              size: 'large',
              color: 'blue',
              shape: 'rect',
              label: 'checkout'
            }}
          />}
          {(activePayment === "apple pay" && paymentRequest) &&
          <PaymentRequestButtonElement options={{paymentRequest}}/>}
          <button className="pay__modal--submit" type="submit">Buy Now</button>
        </form>
      </div>
    </div>
  );
};

export default connect()(UpdateAddPayment);

