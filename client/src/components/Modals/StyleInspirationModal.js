import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { ReactComponent as Cancel } from "../../assets/img/close-2.svg";
import { ReactComponent as Instagram } from "../../assets/img/instagram.svg";
import { ReactComponent as Youtube } from "../../assets/img/youtube.svg";
import { ReactComponent as TikTok } from "../../assets/img/tik-tok.svg";
import { ReactComponent as OnlyFans } from "../../assets/img/OnlyFans_logo.svg";
import { ReactComponent as Tick } from "../../assets/img/accept_added_check_complite_yes_icon.svg";
import { createProjectMedia } from '../../store/actions/project.action';

const StyleInspirationModal = (props) => {

  const history = useHistory();

  const [platforms, setPlatforms] = useState([{
    title: "TikTok",
    src: <TikTok />,
    active: true
  }, {
    title: "OnlyFans",
    src: <OnlyFans />,
    active: false
  }, {
    title: "Youtube",
    src: <Youtube />,
    active: false
  }, {
    title: "Instagram",
    src: <Instagram />,
    active: false
  }]);
  const [favouriteRelevant, setFavouriteRelevant] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const [link, setLink] = useState('')


  const changePlatform = (i) => {
    let newPlatforms = [...platforms];
    newPlatforms.map(platform => platform.active = false);
    newPlatforms[i].active = true;
    setPlatforms(newPlatforms);
  }
  const updateImageComments = (id) => {
    let newCurrentMedia = {...props.currentMedia};
    let newContent = [...props.content];
    let index = props.content.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if(localStorage.imageComments) {
      let newComments = localStorage.imageComments;
      newContent[index].comment = newComments;
      newContent[index].createdAt = new Date();
    }
    return newContent;
  }
  const updateComments = (id) => {
    let newCurrentMedia = { ...props.currentMedia };
    let newContent = [...props.content];
    let index = props.content.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if (localStorage.comments) {
      let newComments = JSON.parse(localStorage.comments);
      // newCurrentMedia = newCurrentMedia.screens.map((item, i) => {
      //   return newComments[i].text.length > 0 ? { ...item, comment: newComments[i] } : item
      // })

      // newContent[index].screens = newCurrentMedia;
      newContent[index].comments = newComments;
      props.setComments([]);
    }
    return newContent;
  }

  const handleDone = () => {
    let newContent
    if(!props.isImage){
      if ((localStorage.updateComment && localStorage.updateComment === 'true')
        || (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true')) {
        newContent = updateComments(localStorage.currentMedia);
      } else {
        newContent = props.content
      }
    }else{
      newContent = updateImageComments(localStorage.currentMedia)
    }
    const project = {
      ...props.project,
      styleInspiration: {
        link,
        platform: platforms.filter(item => item.active)[0].title
      },
      content: newContent
    }
    props.setShowStyleModal(false);
    props.setLoading(true);
    props.dispatch(createProjectMedia(project, history, props.setLoading))
  };

  return (
    <div className="modal__wrapper" style={{zIndex: localStorage.showDemoLayer === 'true' && '130'}}>
      <div className="style__modal">
        <div className="connectSocial__cross" onClick={() => props.setShowStyleModal(false)}>
          <Cancel fill="black" />
        </div>
        <h3>Style Inspiration</h3>
        <p>Lorem ipsum dolor sit amet</p>
        <h5>Style Inspiration</h5>
        <input type="text" placeholder="Paste your link here" value={link} onChange={e => setLink(e.target.value)} />
        <h5>Target Platform Length</h5>
        <div className="connectSocial__links">
          {platforms.map((platform, i) => (
            <div className="modal__payments--item" key={i} style={{
              border: `1px solid ${platform.active ? "#3b8590" : '#36596a55'}`,
              backgroundColor: platform.active ? '#3b85911a' : 'white'
            }}
              onClick={() => changePlatform(i)}
            >
              <div className="modal__plans--tick" style={{ backgroundColor: platform.active ? "#3b8590" : "rgba(133,134,149,0.1)" }}>
                {platform.active && <Tick fill="white" />}
              </div>
              {platform.src}
            </div>
          ))}
        </div>
        <h5>Any favourite relevant?</h5>
        <div className="favourite__relevant">
          <div style={{
            border: `1px solid ${!favouriteRelevant ? "#3b8590" : '#36596a55'}`,
            backgroundColor: !favouriteRelevant ? '#3b85911a' : 'white'
          }} onClick={() => setFavouriteRelevant(false)}>No</div>
          <div style={{
            border: `1px solid ${favouriteRelevant ? "#3b8590" : '#36596a55'}`,
            backgroundColor: favouriteRelevant ? '#3b85911a' : 'white'
          }} onClick={() => setFavouriteRelevant(true)}>Yes</div>
        </div>
        <h5>Style Suggestions</h5>
        <div className="favourite__relevant">
          <div style={{
            border: `1px solid ${!suggestion ? "#3b8590" : '#36596a55'}`,
            backgroundColor: !suggestion ? '#3b85911a' : 'white'
          }} onClick={() => setSuggestion(false)}>No</div>
          <div style={{
            border: `1px solid ${suggestion ? "#3b8590" : '#36596a55'}`,
            backgroundColor: suggestion ? '#3b85911a' : 'white'
          }} onClick={() => setSuggestion(true)}>Yes</div>
        </div>
        <button className="pay__modal--submit" type="button" onClick={handleDone}>Done</button>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  project: state.project.project
})

export default connect(mapStateToProps)(StyleInspirationModal);
