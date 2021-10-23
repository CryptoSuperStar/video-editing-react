import React from 'react';
import {ReactComponent as ArrowArrow} from "../../assets/img/arrow.svg";


const ToolTip = ({title, text, src, name}) => {
  return (
    <section className={name}>
      <div className="DemoLayer__title">{title}</div>
      <span className="DemoLayer__text">{text}</span>
      {src ?  <img src={src} alt="arrow-demo" className="arrow-demo"/> : <ArrowArrow/>}
    </section>
  );
};

export default ToolTip;
