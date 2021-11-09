import React from 'react';
import moment from "moment";
import './CommentBlock.scss';

const CommentBlock = ({ arrComments, isImage }) => {
  console.log(arrComments,'arrComments',isImage);
  return (
    <div className="CommentBlock">
      <h5>Pinned Notes</h5>
      {arrComments.map((scr, i) => {
        return (scr.text.length > 0 ?
            <div className="comment__item" key={i}>
              <div className="comment_time">{scr.time}</div>
              <div className="comment__text">{scr.text}</div>
              <div className="comment__date">{moment(scr.createdAt).format('Do MMMM, YYYY hh:mm a')}</div>
            </div> : ""
          )
      })}
    </div>
  );
};

export default CommentBlock;
