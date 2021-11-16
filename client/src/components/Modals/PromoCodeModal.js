import React, { useState } from 'react'
import { connect } from "react-redux";
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import { ReactComponent as ArrowLeft } from "../../assets/img/arrow-left.svg";
import { confirmPromoCode } from '../../store/actions/auth.action';
function PromoCodeModal(props) {
    const [promoCode, setPromoCode] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        props.dispatch(confirmPromoCode(promoCode, props.setShowPromoCodeWall))
    }
    return (
        <div className=" modal__wrapper">
            <div className="style__modal">
                <div className="connectSocial__cross" onClick={() => props.setShowPromoCodeWall(false)}>
                    <Cancel fill="black" className="connectSocial__cross--cancel" />
                    <ArrowLeft className="connectSocial__cross--arrowLeft" />
                </div>
                <h3>Apply Promo Code</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Enter your Promo code here" value={promoCode} onChange={e => setPromoCode(e.target.value)} required />
                    <button className="pay__modal--submit" type="submit" >Apply</button>
                </form>
            </div>
        </div>
    )
}

export default connect()(PromoCodeModal);
