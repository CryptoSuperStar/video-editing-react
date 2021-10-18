import React from 'react';
import {SortableElement} from 'react-sortable-hoc';

const DraggableContentItem = SortableElement(({media,setMedia, itemWidth}) => {
  return (
    <div className="mediaFiles__slider--inner" key={media._id}
         style={{backgroundImage: (media.isImage || (media.screens && media.screens.length > 0))
             ? `url(${media.isImage ? media.mediaSrc : media.screens[1].screenSrc})` : 'black',
           width: itemWidth + 3 + 'px'
         }}
         onClick={() => {
           localStorage.currentMedia = media._id;
           setMedia();
         }}
    >
      <p>{media.mediaName}</p>
    </div>
  );
});

export default DraggableContentItem;
