import React, { useState, useEffect, Fragment } from "react";
import Switch from "react-switch";
import { connect } from "react-redux";
import "./Landing.scss";
import { Link, Redirect } from "react-router-dom";
import phone from "../../assets/img/phone.png";
import logo2 from "../../assets/img/logo2.png";
import tick from "../../assets/img/path-10@1x.png";
import screen1 from "../../assets/img/screen1.png";
import screen2 from "../../assets/img/screen2.png";
import screen3 from "../../assets/img/screen3.png";
import screen4 from "../../assets/img/screen4.png";
import FooterNav from "../FooterNav/FooterNav";
const Landing = (props) => {
  const [checkedSwitch, setCheckedSwitch] = useState(true);
  const [width, setWidth] = useState(window.innerWidth);
  const [marginLeft, setMarginLeft] = useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  useEffect(() => {
    window.addEventListener("resize", () => setWidth(window.innerWidth));
    return () => {
      window.removeEventListener("resize", () => setWidth(window.innerWidth));
    };
  }, []);

  const renderTick = (text) => (
    <div className="tick__item">
      <div className="tick__item--image">
        <img src={tick} alt="tick" />
      </div>
      <span>{text}</span>
    </div>
  );

  const handleTouchStart = (e) => {
    if (width <= 575) {
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (width <= 575) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (width <= 575) {
      if (touchStart - touchEnd > 50 && marginLeft !== -width * 3) {
        // do your stuff here for left swipe
        setMarginLeft(marginLeft - width);
      }

      if (touchStart - touchEnd < -50 && marginLeft !== 0) {
        // do your stuff here for right swipe
        setMarginLeft(marginLeft + width);
      }
    }
  };

  const renderMobileView = (title, text, bullets, active) => (
    <div className="mobile__view">
      {active < 4 && (
        <div className="screen__mobile">
          <div className="screen__mobile--dots">
            {[...Array(4)].map((dot, i) => (
              <span
                key={i}
                className="screen__mobile--dot"
                style={{
                  backgroundColor: i === active ? "#3b8590" : "#d8e1f1",
                  transform: `scale(${i === active ? "1.5, 1.5" : "1,1"})`,
                }}
                onClick={() => setMarginLeft(i * -width)}
              />
            ))}
          </div>
          <h3>{title}</h3>

          {text !== null && (
            <Fragment>
              <p>{text}</p>
            </Fragment>
          )}

          {bullets !== null &&
            bullets.map((item, i) => (
              <div key={item + i}>{renderTick(item)}</div>
            ))}

          {localStorage.isAuthenticated !== "true" && (
            <Fragment>
              <button
                className="mobile__view--next"
                onClick={() => {
                  props.history.push("/sign_up");
                }}
              >
                Get started
              </button>
              <span style={{ margin: "0" }}>
                Start your 7-day free trial now
              </span>
            </Fragment>
          )}
        </div>
      )}
    </div>
  );

  const handleSwitch = (checked) => setCheckedSwitch(checked);
  if (localStorage.isAuthenticated === "true")
    return <Redirect to="/dashboard/upload" />;

  return (
    <div
      className="Landing__block container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <section className="Landing__control container__inner web__view">
        <div className="Landing__control--text">
          <h3>Better than Dropbox and Google Drive for Video Creators</h3>
          <span>Helping humans stay competitive with AI editors</span>
          {localStorage.isAuthenticated === "false" && (
            <Fragment>
              <Link to="/sign_up">Get Started</Link>
              <span>Start your 7-day free trial now</span>
            </Fragment>
          )}
        </div>
        <div className="Landing__control--image">
          <img src={phone} alt="phone" />
          <div className="oval__green" />
          <div className="ring__black" />
          <div className="theBest">
            <img src={logo2} alt="logo2" />
            <span>Get the very best with MyVideosPro</span>
          </div>
        </div>
      </section>

      <section
        className="screen"
        style={{ backgroundColor: "#fff", display: width >= 575 && "none" }}
      >
        <div
          className="container__inner screen__inner"
          style={{ width: width <= 575 && width + "px" }}
        >
          <div className="screen__image" style={{ textAlign: "center" }}>
            <img
              src={screen4}
              alt="screen2"
              style={{ marginTop: "30px", height: "250px", width: "auto" }}
            />
          </div>
          {renderMobileView(
            "Better than Dropbox and Google Drive for Video Creators",
            "Helping humans stay competitive with AI editors",
            null,
            0
          )}
        </div>
      </section>

      <section
        className="screen"
        style={{
          backgroundColor: "#F7F7FBFF",
          width: width <= 575 && width + "px",
          marginLeft: width <= 575 && marginLeft + "px",
        }}
      >
        <div
          className="container__inner screen__inner"
          style={{ width: width <= 575 && width + "px" }}
        >
          <div className="screen__text web__view">
            <h3 className="screen__title">
              Transfer video and edit notes. Store Projects.
            </h3>
            <span>
              Built for videographers, video editors, and content producers
            </span>
            <div className="screen__ticks">
              {renderTick("Fastest Way to Transfer Video")}
              {renderTick("Tag edit notes to specific times in the footage")}
              {renderTick("Upload revisions and get feedback")}
              {renderTick("Supports HD audio and video files")}
            </div>
          </div>
          <div className="screen__image">
            <img src={screen1} alt="screen1" />
          </div>
          {renderMobileView(
            "Transfer video and edit notes. Store Projects.",
            "Built for videographers, video editors, and content producers",
            [
              "Fastest Way to Transfer Video",
              "Tag edit notes to specific times in the footage",
              "Upload revisions and get feedback",
              "Supports HD audio and video files",
            ],
            1
          )}
        </div>
      </section>

      <section className="screen" style={{ backgroundColor: "#fff" }}>
        <div
          className="container__inner screen__inner"
          style={{ width: width <= 575 && width + "px" }}
        >
          <div className="screen__image">
            <img src={screen2} alt="screen2" />
          </div>
          {renderMobileView(
            "Built for Video Creators",
            null,
            [
              "2TB+ of media content storage",
              "Less expensive than Google Drive and Dropbox",
              "Fastest Upload time",
              "Handle video format conversion",
            ],
            2
          )}
          <div className="screen__text web__view">
            <h3 className="screen__title">Built for Video Creators</h3>
            <span></span>
            <div className="screen__ticks">
              {renderTick("2TB+ of media content storage")}
              {renderTick("Less expensive than Google Drive and Dropbox")}
              {renderTick("Fastest Upload time")}
              {renderTick("Handle video format conversion")}
            </div>
          </div>
        </div>
      </section>

      <section className="screen" style={{ backgroundColor: "#F7F7FBFF" }}>
        <div
          className="screen__inner container__inner"
          style={{ width: width <= 575 && width + "px" }}
        >
          <div className="screen__text web__view">
            <h3 className="screen__title">
              Supports both Editors and Clients.
            </h3>
            <span></span>
            <div className="screen__ticks">
              {renderTick("Clients can upload their videos for free")}
              {renderTick("Handle multiple client accounts for one editor")}
              {renderTick("Track client revisions")}
              {renderTick("Receive client notes tagged to specific times")}
            </div>
          </div>
          <div className="screen__image">
            <img src={screen3} alt="screen3" />
          </div>
          {renderMobileView(
            "Supports both Editors and Clients.",
            null,
            [
              "Clients can upload their videos for free",
              "Handle multiple client accounts for one editor",
              "Track client revisions",
              "Receive client notes tagged to specific times",
            ],
            3
          )}
        </div>
      </section>

      <section
        className="screen"
        style={{ backgroundColor: "#fff", display: width >= 575 && "none" }}
      >
        <div
          className="container__inner screen__inner"
          style={{ width: width <= 575 && width + "px" }}
        >
          <div className="screen__image" style={{ textAlign: "center" }}></div>
          {renderMobileView(null, null, null, 4)}
        </div>
      </section>

      <section className="plans web__view">
        <div className="container__inner">
          <h3 className="screen__title">Pricing & Plans</h3>
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
            {checkedSwitch ? (
              <div className="plans__item">
                <h5>Recommended</h5>
                <div className="price">
                  $<span>16.99</span>/mo
                </div>
                <div className="billed">Billed Annually</div>
                <div className="plan__feature">
                  {renderTick("Same price as Google Drive")}
                  {renderTick("Double the features")}
                </div>
                <div
                  className="plan__btn"
                  onClick={() => props.history.push("/sign_up")}
                >
                  Start 7 Days Free Trial
                </div>
              </div>
            ) : (
              <div className="plans__item">
                <h5>Starter</h5>
                <div className="price">
                  $<span>20</span>/mo
                </div>
                <div className="billed">Billed Monthly</div>
                <div className="plan__feature">
                  {renderTick("Same price as Google Drive")}
                  {renderTick("Double the features")}
                </div>
                <div
                  className="plan__btn"
                  onClick={() => props.history.push("/sign_up")}
                >
                  Start 7 Days Free Trial
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="questions web__view">
        <div className="container__inner questions__inner">
          <div className="questions__title">
            <h3 className="screen__title">Control. Build. Grow.</h3>
            {localStorage.isAuthenticated === "false" && (
              <Fragment>
                <Link to="/sign_in">Start 7 Days Free Trial</Link>
              </Fragment>
            )}
          </div>
        </div>
      </section>
      <FooterNav />
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);
