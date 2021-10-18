import React, {useState, useEffect, Fragment} from 'react';
import Switch from "react-switch";
import {connect} from "react-redux";
import './Landing.scss';
import {Link} from "react-router-dom";
import phone from '../../assets/img/phone.png';
import logo2 from "../../assets/img/logo2.png";
import tick from "../../assets/img/path-10@1x.png";
import screen1 from "../../assets/img/screen1.png";
import screen2 from "../../assets/img/screen2.png";
import screen3 from "../../assets/img/screen3.png";
import screen4 from "../../assets/img/screen4.png";
import {ReactComponent as ArrowRight} from "../../assets/img/right-arrow.svg";
import FooterNav from "../FooterNav/FooterNav";

const Landing = (props) => {
  
  const [checkedSwitch, setCheckedSwitch] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [marginLeft, setMarginLeft] = useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  
  useEffect(() => {
    window.addEventListener("resize", () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener("resize", () => setWidth(window.innerWidth));
    }
  },[])
  
  const renderTick = text => (
    <div className="tick__item">
      <div className="tick__item--image">
        <img src={tick} alt="tick"/>
      </div>
      <span>{text}</span>
    </div>
  )
  
  const renderArrow = title => (
    <div className="question__title">
      <div className="question__title--image">
        <ArrowRight fill="white"/>
      </div>
      <span>{title}</span>
    </div>
  )
  
  const handleTouchStart = (e) => {
    if (width <= 575) {
      setTouchStart(e.targetTouches[0].clientX);
    }
  }
  
  const handleTouchMove = (e) => {
    if (width <= 575) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  }
  
  const handleTouchEnd = () => {
    if (width <= 575) {
      if (touchStart - touchEnd > 50 && marginLeft !== (-width * 3)) {
        // do your stuff here for left swipe
        setMarginLeft(marginLeft - width);
      }
  
      if (touchStart - touchEnd < -50 && marginLeft !== 0) {
        // do your stuff here for right swipe
        setMarginLeft(marginLeft + width)
      }
    }
  }
  
  const renderMobileView = (title, text, active) => (
    <div className="mobile__view">
      <div className="screen__mobile">
        <div className="screen__mobile--dots">{[...Array(4)].map((dot, i) => (
          <span
            key={i}
            className="screen__mobile--dot"
            style={{
              backgroundColor: i === active ? '#3b8590' : '#d8e1f1',
              transform: `scale(${i === active ? '1.5, 1.5': '1,1'})`}}
            onClick={() => setMarginLeft(i * -width)}/>
        ))}
        </div>
        <h3>{title}</h3>
        <p>{text}</p>
        {localStorage.isAuthenticated === 'false'
        &&
        <Fragment>
          <button className="mobile__view--next" onClick={() => {
            props.history.push('/sign_up')
          }}>Get started</button>
          <Link to="/sign_in" style={{marginBottom: active === 3 && "50px"}}>Login</Link>
        </Fragment> }
        
      </div>
    </div>
  )
  
  const handleSwitch = checked => setCheckedSwitch(checked);
  
  return (
    <div className="Landing__block container"
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
    >
      <section className="Landing__control container__inner web__view">
        <div className="Landing__control--text">
          <h3>Control your social media influence.</h3>
          <span>
            Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>
          {localStorage.isAuthenticated === 'false' &&
          <Fragment>
            <Link to="/sign_up">Get Started</Link>
            <span>Start your 7-day free trial now</span>
          </Fragment>}
          
        </div>
        <div className="Landing__control--image">
          <img src={phone} alt="phone"/>
          <div className="oval__green" />
          <div className="ring__black" />
          <div className="theBest">
            <img src={logo2} alt="logo2"/>
            <span>Get the very best with ProVid</span>
          </div>
        </div>
      </section>
      <section className="screen"
               style={{backgroundColor: '#F7F7FBFF', width: width <= 575 && width + "px", marginLeft: width <= 575 && marginLeft + "px"}}>
        <div className="screen__inner container__inner"
             style={{width: width <= 575 && width + "px"}}>
          <div className="screen__text web__view">
            <h3 className="screen__title">Screen </h3>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>
            <div className="screen__ticks">
              {renderTick("Lorem ipsum dolor")}
              {renderTick("Sit amet lorem")}
              {renderTick("Ipsum dolor sit")}
              {renderTick("Lorem ipsum sit")}
            </div>
          </div>
          <div className="screen__image">
            <img src={screen1} alt="screen1"/>
          </div>
          {renderMobileView("Screen 1", "Lorem ipsum dolor sit amet, consectetur",0)}
        </div>
      </section>
      
      <section className="screen" style={{backgroundColor: '#fff'}}>
        <div className="container__inner screen__inner" style={{width: width <= 575 && width + "px"}}>
          <div className="screen__image">
            <img src={screen2} alt="screen2"/>
          </div>
          {renderMobileView("Screen 2", "Lorem ipsum dolor sit amet, consectetur",1)}
          <div className="screen__text web__view">
            <h3 className="screen__title">Another screen</h3>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </span>
            <div className="screen__ticks">
              {renderTick("Lorem ipsum dolor")}
              {renderTick("Sit amet lorem")}
              {renderTick("Ipsum dolor sit")}
              {renderTick("Lorem ipsum sit")}
            </div>
          </div>
        </div>
      </section>
  
      <section className="screen" style={{backgroundColor: '#F7F7FBFF'}}>
        <div className="screen__inner container__inner" style={{width: width <= 575 && width + "px"}}>
          <div className="screen__text web__view">
            <h3 className="screen__title">For Us</h3>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </span>
            <div className="screen__ticks">
              {renderTick("Lorem ipsum dolor")}
              {renderTick("Sit amet lorem")}
              {renderTick("Ipsum dolor sit")}
              {renderTick("Lorem ipsum sit")}
            </div>
          </div>
          <div className="screen__image">
            <img src={screen3} alt="screen3"/>
          </div>
          {renderMobileView("Screen 3", "Lorem ipsum dolor sit amet, consectetur",2)}
        </div>
      </section>
  
      <section className="screen" style={{backgroundColor: '#fff'}}>
        <div className="container__inner screen__inner" style={{width: width <= 575 && width + "px"}}>
          <div className="screen__image" style={{marginTop: 0}}>
            <img src={screen4} alt="screen4"/>
          </div>
          {renderMobileView("Screen 4", "Lorem ipsum dolor sit amet, consectetur",3)}
          <div className="screen__text web__view">
            <h3 className="screen__title">Good screens</h3>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </span>
            <div className="screen__ticks">
              {renderTick("Lorem ipsum dolor")}
              {renderTick("Sit amet lorem")}
              {renderTick("Ipsum dolor sit")}
              {renderTick("Lorem ipsum sit")}
            </div>
          </div>
        </div>
      </section>
      
      <section className="plans web__view">
        <div className="container__inner">
          <h3 className="screen__title">Pricing & Plans</h3>
          <span className="plans__text">Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt.
          </span>
          <span className="plans__choose">
            Monthly
            <Switch
              onChange={handleSwitch}
              checked={checkedSwitch}
              onColor="#86d3ff"
              onHandleColor="#2693e6"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={30}
              width={100}
              className="react-switch"
              id="material-switch"
            />
            Yearly
            <span className="save">Save 25%</span>
          </span>
          <div className="plans__items">
            <div className="plans__item">
              <h5>Starter</h5>
              <div className="price">$<span>49</span>/mo</div>
              <div className="billed">Billed Annually</div>
              <div className="plan__feature">
                {renderTick("Lorem ipsum dolor sit amet")}
                {renderTick("Consectetur adipiscing elit")}
                {renderTick("Sed do eiusmod tempor incididunt")}
                {renderTick("Ut labore et dolore magna aliqua")}
                {renderTick("Lorem ipsum dolor sit amet")}
              </div>
              <div className="plan__btn" onClick={() =>props.history.push('/sign_up')}>
                Start 7 Days Free Trial</div>
            </div>
  
            <div className="plans__item">
              <h5>Recommended</h5>
              <div className="price">$<span>75</span>/mo</div>
              <div className="billed">Billed Monthly</div>
              <div className="plan__feature">
                {renderTick("Lorem ipsum dolor sit amet")}
                {renderTick("Consectetur adipiscing elit")}
                {renderTick("Sed do eiusmod tempor incididunt")}
                {renderTick("Ut labore et dolore magna aliqua")}
                {renderTick("Lorem ipsum dolor sit amet")}
              </div>
              <div className="plan__btn" onClick={() =>props.history.push('/sign_up')}>
                Start 7 Days Free Trial</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="questions web__view">
        <div className="container__inner questions__inner">
          <div className="question__item">
            {renderArrow("Is there a refund policy?")}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div className="question__item">
            {renderArrow("How do I learn to use ProVid?")}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div className="question__item">
            {renderArrow("Can I connect with others?")}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div className="question__item">
            {renderArrow("How to upload my content?")}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          <div className="questions__title">
            <h3 className="screen__title">Control. Build. Grow</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
            {localStorage.isAuthenticated === 'false' &&
            <Fragment>
              <Link to="/sign_in">Start 7 Days Free Trial</Link>
              <span>No credit card required</span>
            </Fragment>}
          </div>
        </div>
      </section>
      <FooterNav />
    </div>
  );
};

const mapStateToProps = state => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated
  }
)

export default connect(mapStateToProps)(Landing);
