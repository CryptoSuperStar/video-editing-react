import React from 'react';

const ToolTip = ({title, text, src, name, comp}) => {
  return (
    <section className={name}>
      <div className="DemoLayer__title">{title}</div>
      <span className="DemoLayer__text">{text}</span>
      <img src={src} alt="arrow-demo" className="arrow-demo"/>
    </section>
  );
};

export default ToolTip;
