import React from 'react';
import moment from "moment";
import './CommentBlock.scss';

const CommentBlock = ({ arrComments }) => {
  return (
    <div className="CommentBlock">
      <h5>Pinned Notes</h5>
      {arrComments.map((scr, i) => (
        scr.length ? scr.map((item, i) => {
          return (item.text.length > 0 ?
            <div className="comment__item" key={i}>
              <div className="comment_time">{item.time}</div>
              <div className="comment__text">{item.text}</div>
              <div className="comment__date">{moment(item.createdAt).format('Do MMMM, YYYY hh:mm a')}</div>
            </div> : ""
          )
        }) : ''
      ))}
    </div>
  );
};

export default CommentBlock;
