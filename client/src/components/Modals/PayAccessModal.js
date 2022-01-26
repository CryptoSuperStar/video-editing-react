import React from 'react';
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import accessImage from "../../assets/img/base@1x.png";
import { ReactComponent as Tick } from "../../assets/img/accept_added_check_complite_yes_icon.svg";
import { useHistory } from 'react-router-dom';

const PayAccessModal = (props) => {
  const history = useHistory();
  const renderTick = text => (
    <div className="pay__modal--tick_item">
      <div className="pay__modal--tick_image">
        <Tick />
      </div>
      <span>{text}</span>
    </div>
  )

  return (
    <div className="modal__wrapper">
      <div className="pay__access--modal">
        <h3>Access All Premium Features</h3>
        {/* <div className="access__modal--image_block"> */}
          {/* <img src={accessImage} alt="access_image" />
          <h5>Start your 7-day Free trial now!</h5> */}
          {/* <button type="button" onClick={() => {
            props.setShowPayAccess(false);
            props.setShowPayWall(true);
          }
          }>
            <span>$ 9.99 per mo.</span>
            <ArrowRight />
          </button> */}
        {/* </div> */}
        {renderTick("Fastest way to get footage and notes from clients")}
        {renderTick("Tag edit notes to timeline in footage")}
        {renderTick("Track revisions and easily send video to customer")}
        {renderTick("Faster uploads than dropbox")}
        <button className="go__pro" onClick={() => {
          props.setShowPayAccess(false);
          props.setShowPayWall(true);
        }
        }>Go Professional
        </button>
      </div>
    </div>
  );
};

export default PayAccessModal;
