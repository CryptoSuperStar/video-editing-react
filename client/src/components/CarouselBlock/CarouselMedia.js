import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from "react-router-dom";
import Carousel from "nuka-carousel";
import { connect } from "react-redux";
import S3 from 'react-aws-s3';
import { arrayMoveImmutable } from 'array-move';
import { REACT_APP_AWS_KEY, REACT_APP_AWS_SECRET_KEY, REACT_APP_BUCKET } from "../../utils/misc";
import { ReactComponent as Plus2 } from "../../assets/img/button.svg";
import './CarouselMedia.scss';
import {
  addMediaToProject,
  takeScreenshots,
  updateContent,
  deleteVideo,
  clearTempProject
} from "../../store/actions/project.action";
import { toast } from "react-toastify";
import DraggableContentList from "../DraggableContent/DraggableContentList";
import { mediaTypeVideo } from '../../utils/constant';
import { FaDownload } from 'react-icons/fa'

const CarouselMedia = (props) => {

  const history = useHistory();
  const fileInput = useRef();
  const sliderItemWidth = useRef(null);
  const [contents, setContents] = useState([{}]);
  const [showDraggable, setShowDraggable] = useState(false);
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {

    setContents(props.content);


  }, [props.content])

  const handleChange = (e) => {
    props.setComments([]);
    props.setErrorMessage(null);
    localStorage.removeItem('comments');
    const file = e.target.files[0]; // accessing file
    const fileSize = file.size / 1048576;
    if (fileSize > 2048) {
      toast.error('The File size should be less than 2GB')
    } else {
      let newFileName = e.target.files[0].name;
      newFileName = newFileName.replace(/ /g, '_');
      newFileName = newFileName.replace(/\(|\)/g, '');
      const config = {
        bucketName: REACT_APP_BUCKET,
        dirName: `${props.user._id}/${props.project.bucket}`,
        region: 'us-east-2',
        accessKeyId: REACT_APP_AWS_KEY,
        secretAccessKey: REACT_APP_AWS_SECRET_KEY
      }
      const ReactS3Client = new S3(config);
      props.setLoadingVideo(true);
      ReactS3Client.uploadFile(file, newFileName).then(data => {
        if (data.status === 204) {
          props.dispatch(addMediaToProject(data.location, localStorage.currentProjectId, props.project.bucket, props.setLoadingVideo))
            .then((res) => {
              let currentMedia = res.currentMedia;
              localStorage.currentMedia = res.currentMedia._id;
              props.setIsShowComment(false);
              props.setShowShareModal(false);
              props.setComments([]);
              props.setErrorMessage(null);
              if (res.mediaType === mediaTypeVideo) {
                props.setLoadingSlider(true);
                props.dispatch(takeScreenshots(
                  res.project._id,
                  props.project.bucket,
                  currentMedia.mediaSrc,
                  currentMedia.mediaName
                  , props.setLoadingSlider))
              }
            })
        } else {
          toast.error('The File was no uploaded to AWS')
        }
      })
    }
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setContents(arrayMoveImmutable(contents, oldIndex, newIndex));
    let newContent = arrayMoveImmutable(contents, oldIndex, newIndex)
    props.dispatch(updateContent(newContent));
  };
  // this function is no longer required because we are updating comment in mongoDB on press "Enter" while adding comments.
  const updateComments = (id) => {
    let newCurrentMedia = { ...props.currentMedia };
    let newContent = [...props.project.content];
    let index = contents.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if (localStorage.comments && newCurrentMedia.screens.length) {
      let newComments = JSON.parse(localStorage.comments);
      // newCurrentMedia = newCurrentMedia.screens.map((item, i) => {
      //   return newComments[i].text.length > 0 ? { ...item, comment: newComments[i] } : item
      // })
      newContent[index].comments = newComments;
      props.setComments([]);
    }
    props.dispatch(updateContent(newContent));
  }

  const deleteVideoHandle = (e, id) => {
    e.stopPropagation();
    let newContent = props.project.content.filter(con => con._id !== id);
    let deletedVideo = props.project.content.filter(con => con._id === id);
    setContents(newContent);
    if (props.project.content.length === 1) {
      props.dispatch(deleteVideo(newContent, deletedVideo[0], props.project.bucket)).then(() => {
        props.dispatch(clearTempProject(props.project._id, props.project.bucket))
        history.push('/dashboard/upload');
      });
    } else {
      props.dispatch(deleteVideo(newContent, deletedVideo[0], props.project.bucket))
    }

  }

  return (
    <div className="mediaFiles__slider" onDoubleClick={(e) => {
      e.stopPropagation();
      setShowDraggable(!showDraggable);
      setShowArrow(false);
    }}
    >
      {!showDraggable ? <Carousel slidesToShow={window.innerWidth <= 575 ? 3 : 5}
        heightMode="first"
        defaultControlsConfig={{
          nextButtonText: '>',
          prevButtonText: '<',
          pagingDotsStyle: {
            display: "none"
          }
        }}
        dragging={true}
      >
        {contents.map(media => (
          <>
            <div className="mediaFiles__slider--inner" key={media._id}
              style={{border: localStorage.currentMedia === media._id ? `8px solid hsl(229deg 82% 11%)` : props.editedProject._id === media._id && `8px solid #4ea0d6`,
                background: (media.isImage || (media.screens && media.screens.length > 0))
                  ? `url(${media.isImage ? media.mediaSrc : media.screens[1].screenSrc})` : 'black'
              }}
              onClick={async () => {
                if (props.project?.projectStatus === "Draft") {
                  if (localStorage.updateComment && localStorage.updateComment === 'true') {
                    await updateComments(localStorage.currentMedia);
                  }
                  if (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true') {
                    await updateComments(localStorage.currentMedia)
                  }
                }

                localStorage.currentMedia = media._id;
                props.setIsShowComment(false)
                props.setShowShareModal(false);
                props.setComments([]);
                props.setErrorMessage(null);
                props.setMedia();
              }
              }
            >
              {props.editedProject._id === media._id && <span className='vertical_line'></span>}
              <p>{media.mediaName}</p>
              {props.isEditor && <a href={`${media.mediaSrc}`} target="_blank" rel="noreferrer" download={`${media.mediaSrc}`} title='Download'> <span className="download__video--btn">
                <FaDownload size={"30px"} />
              </span></a>}
              {props.project.projectStatus === "Draft" && <span className="delete__video--btn" onClick={(e) =>
                deleteVideoHandle(e, media._id)}>X</span>}
            </div>
          </>
        ))}
        {(props.project.projectStatus === "Draft" || (props.isEditor && props.project.projectStatus !== "Done")) && <div className="mediaFiles__slider--inner" ref={sliderItemWidth}
          onClick={() => {
            if ((localStorage.updateComment && localStorage.updateComment === 'true')
              || (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true')) {
              updateComments(localStorage.currentMedia);
            }
          }
          }
        >
          <input type="file" ref={fileInput} onChange={(e) => {
            handleChange(e)
          }} id="mediaFiles__button"
            accept="audio/*,video/*,image/*"
          />
          <label htmlFor="mediaFiles__button">
            <Plus2 />
          </label>
          <span className="tip_icon" style={{ marginTop: "6px", marginRight: "5px" }}>
            i
            <span className="info" style={{ marginTop: "10px", marginLeft: "-100px" }}>
              Add more media files to your project.
            </span>
          </span>
        </div>}
      </Carousel>
        :
        <DraggableContentList
          contents={contents}
          axis="x"
          distance={15}
          onSortEnd={onSortEnd}
          setMedia={props.setMedia}
          itemWidth={sliderItemWidth.current && sliderItemWidth.current.clientWidth}
        />}
    </div >
  );
}

const mapStateToProps = state => ({
  project: state.project.project
})

export default connect(mapStateToProps)(CarouselMedia);
