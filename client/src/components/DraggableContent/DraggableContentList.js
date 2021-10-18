import React, {useState} from 'react';
import {SortableContainer} from 'react-sortable-hoc';
import DraggableContentItem from "./DraggableContentItem";
import {ReactComponent as Arrow} from "../../assets/img/next-2.svg";
import './DraggableContent.scss';

const DraggableContentList = SortableContainer(({contents,setMedia,itemWidth}) => {
  
  const [left, setLeft] = useState(0);
  
  return (
    <div className="DraggableContentList__wrapper">
      <div className="DraggableContentList">
        <div className="DraggableContentList__arrow arrow__left" onClick={() =>
          left !== 0 && setLeft(left + 34 + itemWidth)}
             style={{cursor: left === 0 && 'not-allowed'}}
        >
          <Arrow style={{fill: left === 0 && 'black'}}/>
        </div>
        <div className="DraggableContentList" style={{left: left + 'px'}}>
          {contents.map((media, i) => (
            <DraggableContentItem
              index={i}
              key={media._id}
              media={media}
              setMedia={setMedia}
              itemWidth={itemWidth}
            />
          ))}
        </div>
        <div className="DraggableContentList__arrow arrow__right" onClick={() => setLeft(left - 34 - itemWidth)}>
          <Arrow/>
        </div>
      </div>
    </div>
  );
})

export default DraggableContentList;
