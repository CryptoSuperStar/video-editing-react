import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {ReactComponent as Cancel} from "../../assets/img/close-2.svg";
import {ReactComponent as Tick} from "../../assets/img/accept_added_check_complite_yes_icon.svg";
import {CardCvcElement, CardExpiryElement, CardNumberElement, PaymentRequestButtonElement, useElements,
  useStripe} from "@stripe/react-stripe-js";
import PaypalExpressBtn from "react-paypal-express-checkout";
import {toast} from "react-toastify";
import axios from "axios";
import moment from "moment";
import {REACT_APP_PAYPAL_API,REACT_APP_API_URL} from "../../utils/misc";
import {ReactComponent as CreditCard} from "../../assets/img/credit-card.svg";
import {ReactComponent as PayPal} from "../../assets/img/paypal.svg";
import {ReactComponent as ApplePay} from "../../assets/img/apple-pay.svg";
import {ReactComponent as ArrowLeft} from "../../assets/img/arrow-left.svg";
import {updateUser} from "../../store/actions/auth.action";
import './PayWallModal.scss';
import penDot from "../../assets/img/penDot.png";

const PayWallModal = (props) => {
  
  const stripe = useStripe();
  const elements = useElements();
  
  let payment = {
      paymentId: '',
      holder: '',
      cardNumberLast4str: '',
      paidBy: null,
      plan: {
        title: '',
        price: '',
        totalCost: '',
        paidDate: '',
        paidExpiresDate: ''
      }
  }
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [plans, setPlans] = useState([{
    title: 'ANNUAL',
    cost: 49,
    active: true,
    totalPrice: 588
  },{
    title: 'MONTHLY',
    cost: 75,
    active: false,
    totalPrice: 75
  }]);
  
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
  let total = plans.filter(plan => plan.active === true)[0].totalPrice;
  const client = {
    sandbox: REACT_APP_PAYPAL_API,
    production: ''
  };
  
  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: "US",
        currency: 'usd',
        total: {
          label: 'Total price',
          amount: total,
        },
        requestPayerName: true,
        requestPayerEmail: true
      });
      // Check the availability of the Payment Request API first.
      pr.canMakePayment().then((result) => {
        if (result) {
          console.log('result2',result)
          pr.on('paymentmethod', handlePaymentMethodReceived);
          setPaymentRequest(pr);
        }
      });
    }
  }, [stripe])
  
  const handlePaymentMethodReceived = async (event) => {
    // Send the payment details to our function.
    const paymentDetails = {
      payment_method: event.paymentMethod.id
    };
    const response = await axios.post(`${REACT_APP_API_URL}/create-payment-intent`,
      {paymentDetails, total}).then((response) => {
        //SUCCESS: put client secret and id into an object and return it
        return {
          secret: response.data.client_secret,
          id: response.data.intent_id,
        };
      },
      (error) => {
        //ERROR: log the error and return
        toast.error(error)
        return error;
      }
    );
    // Report to the browser that the confirmation was successful, prompting
    // it to close the browser payment method collection interface.
    event.complete('success');
    // Let Stripe.js handle the rest of the payment flow, including 3D Secure if needed.
    const result = await stripe.confirmCardPayment(
      response.secret
    );
    
    if (result.error) {
      console.log(result.error);
      toast.error(result.error)
      return;
    }
    if (result.paymentIntent.status === 'succeeded') {
      collectPaymentsData(response.id)
    } else {
      toast.warning(
        `Unexpected status: ${result.paymentIntent.status} for ${result.paymentIntent}`
      );
    }
  };
  
  const changePlan = i => {
    let newPlans = [...plans];
    newPlans.map(plan => plan.active = false);
    newPlans[i].active = true;
    setPlans(newPlans);
  }
  
  const changePayment = i => {
    let newPayments = [...payments];
    newPayments.map(pay => pay.active = false);
    newPayments[i].active = true;
    setActivePayment(newPayments[i].title);
    setPayments(newPayments);
  }
  
  const collectPaymentsData = (paymentId) => {
    let plan = plans.filter(plan => plan.active)[0];
    
    const paymentData = [{
      ...payment,
      paidBy: payment.paidBy ? payment.paidBy : activePayment,
      paymentId,
      holder: `${firstName} ${lastName}`,
      plan: {
        title: plan.title.toLowerCase(),
        price: plan.cost,
        totalCost: plan.totalPrice,
        paidDate: moment().format('MMMM Do YYYY'),
        paidExpiresDate: plan.title.toLowerCase() === "annual"
          ? moment().add(1, 'years').format('MMMM Do YYYY')
          : moment().add(1, 'M').format('MMMM Do YYYY')
      }
    }]
    let newUserInfo = {
      ...props.user,
      payments: paymentData
    }
    console.log(newUserInfo);
    props.dispatch(updateUser(props.user._id, newUserInfo, props.setShowPayWall))
  }
  
  const onSuccess = (pay) => {
    // Congratulation, it came here means everything's fine!
    console.log("The payment was succeeded!", pay);
    if (payment.paid) {
      const [lastName, firstName] = pay.address.recipient_name.split(' ');
      payment = {...payment,
        holder: firstName + ' ' + lastName
      }
      collectPaymentsData(pay.paymentID, firstName, lastName)
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
      payment = {...payment, cardNumberLast4str: paymentMethod.card.last4, paidBy: paymentMethod.card.brand};
      if (error) {
        console.log('[error]', error);
        toast.error(error)
      }
      //STEP 2:
      //create a new payment request and get irs client secret + id from the server
      const intentData = await axios.post(`${REACT_APP_API_URL}/stripe`, {total})
        .then((response) => {
          
            //SUCCESS: put client secret and id into an object and return it
            return {
              secret: response.data.client_secret,
              id: response.data.intent_id,
            };
          },
          (error) => {
            //ERROR: log the error and return
            toast.error(error)
            return error;
          }
        );
      
      //STEP 3:
      //confirm the payment and use the new payment method
      const result = await stripe.confirmCardPayment(intentData.secret, {payment_method: paymentMethod.id});
      //handle errors again
      if (result.error) {
        toast.error(result.error)
        return
      }
      //STEP 4:
      // The payment has been processed! send a confirmation to the server and register user
      if (result.paymentIntent.status === "succeeded") {
        const confirmedPayment = await axios.post(`${REACT_APP_API_URL}/confirm-payment`, {
            //include id of payment
            payment_id: intentData.id,
            payment_type: "stripe",
            //send any other data here
          })
          .then(
            (response) => {
              //SUCCESS: return the response message
              return response.data.success;
            },
            (error) => {
              //ERROR:
              console.log(error);
              toast.error(error);
              return error;
            }
          )
        if (confirmedPayment) {
          collectPaymentsData(intentData.id);
        }
      }
    }
  };
  
  return (
    <div className="modal__wrapper">
      <div className="pay__wall--modal">
        <div className="connectSocial__cross" onClick={() => props.setShowPayWall(false)}>
          <Cancel fill="black" className="connectSocial__cross--cancel"/>
          <ArrowLeft className="connectSocial__cross--arrowLeft"/>
        </div>
        <h3>Buy Pro</h3>
        <p>Lorem ipsum dolor sit amet</p>
        <h5>Select your plan</h5>
        <div className="modal__plans--block">
          {plans.map((plan, i) => (
            <div key={i} className="modal__plans--item" style={{
              border: `1px solid ${plan.active ? "#3b8590" : '#36596a55'}`,
              backgroundColor: plan.active ? '#3b85911a' : 'white'
            }}
                 onClick={() => changePlan(i)}
            >
              <div className="modal__plans--title">
                <strong>{plan.title}</strong>
                <div className="modal__plans--tick"
                     style={{backgroundColor: plan.active ? "#3b8590" : "rgba(133,134,149,0.1)"}}>
                  {plan.active && <Tick fill="white"/>}
                </div>
              </div>
              <div className="modal__plans--price">
                USD {plan.cost}/mo
              </div>
              <div className="modal__plans--price_total">
                Billed {i === 0 ? "annually" : "monthly"} for
                <div>USD {plan.totalPrice}</div>
              </div>
            </div>
          ))}
        </div>
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
            total={total}
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
        
          <h5 style={{marginTop: '30px'}}>Terms and Conditions</h5>
          <div className="pay__modal--Conditions">
            <p>Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit</p>
            <p>sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore</p>
            <p>magna Aliqua Convallis Convallis Tellus Id Interdum Velit Laoreet.</p>
            <p>vitae Purus Faucibus Ornare Suspendisse Sed Nisi Lacus.</p>
            <p>lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit</p>
            <p>sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore</p>
            <p>sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore</p>
            <p>sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore</p>
            <p>sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore</p>
            <p>sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore</p>
          </div>
          <button className="pay__modal--submit" type="submit">Buy Now</button>
        </form>
      </div>
    </div>
  );
};

export default connect()(PayWallModal);
