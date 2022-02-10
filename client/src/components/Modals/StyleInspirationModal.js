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
import Conference  from  "../../assets/vid/Conference .mp4";
import Drone   from "../../assets/vid/Drone .mp4";
import Events from "../../assets/vid/Events.mp4";
import HowTo from "../../assets/vid/HowTo.mp4";
import PodCast1 from "../../assets/vid/PodCast1.mp4";
import PodCast2 from "../../assets/vid/PodCast2.mp4";
import Product from "../../assets/vid/Product.mp4";
import RealEstate from "../../assets/vid/RealEstate.mp4";
import VirtualMeeting from "../../assets/vid/VirtualMeeting.mp4";
import VLOG from "../../assets/vid/vlog.mp4";
import Sports from "../../assets/vid/Sports.mp4";

const StyleInspirationModal = (props) => {
  const [showStyleOption, setShowStyleOption] = useState(false)
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

  const [videotemplates, setVideoTemplate] = useState([{
    title: "Conference",
    url:  Conference,
    active: false
  }, {
    title: "Drone",
    url: Drone,
    active: false
  },
  {
    title: "Events",
    url: Events,
    active: false
  },
  {
    title: "HowTo",
    url: HowTo,
    active: false
  },
  {
    title: "PodCast1",
    url: PodCast1,
    active: false
  },
  {
    title: "PodCast2",
    url: PodCast2,
    active: false
  },
  {
    title: "Product",
    url: Product,
    active: false
  },
  {
    title: "RealEstate",
    url: RealEstate,
    active: false
  },
  {
    title: "VirtualMeeting",
    url: VirtualMeeting,
    active: false
  },
  {
    title: "VLOG",
    url: VLOG,
    active: false
  },
  {
    title: "Sports",
    url: Sports,
    active: false
  },]);
  const [favouriteRelevant, setFavouriteRelevant] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const [link, setLink] = useState('')
  const [category, setCategory] = useState(null);
  const [customCategory, setCustomCategory] = useState(false);
  const [errorCategory, setErrorCategory] = useState(null);


  const changePlatform = (i) => {
    let newPlatforms = [...platforms];
    newPlatforms.map(platform => platform.active = false);
    newPlatforms[i].active = true;
    setPlatforms(newPlatforms);
  }

  const changeTemplate = (i) => {
    let newTemplate = [...videotemplates];
    if(videotemplates[i].active == false)
    {
      newTemplate.map(template=>template.active = false);
      newTemplate[i].active = true;
      setVideoTemplate(newTemplate);
    }
    else {
      newTemplate.map(template=>template.active = false);
      setVideoTemplate(newTemplate);
    }
  }
  const updateImageComments = (id) => {
    let newCurrentMedia = { ...props.currentMedia };
    let newContent = [...props.content];
    let index = props.content.findIndex(content => content._id === id);
    newContent[index] = newCurrentMedia;
    if (localStorage.imageComments) {
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
    // if (category === null || category === '' || category === 'Other')
    // {
    //   if (category === null) {
    //     setErrorCategory('select');
    //   } else {
    //     setErrorCategory('input');
    //   }
    //   return;
    // }

    let newContent
    if (!props.isImage) {
      if ((localStorage.updateComment && localStorage.updateComment === 'true')
        || (localStorage.editedVideoTime && localStorage.editedVideoTime === 'true')) {
        newContent = updateComments(localStorage.currentMedia);
      } else {
        newContent = props.content
      }
    } else {
      newContent = updateImageComments(localStorage.currentMedia)
    }
    const editedProjects = [props.project.editedProjects]
    if (props.project?.projectStatus === "Complete") {
      const revisionContent = newContent[newContent.length - 1];
      delete revisionContent._id;
      editedProjects.push({
        ...revisionContent,
        revision: props.project.projectRevision + 1
      })
    }
    const project = props.project?.projectStatus === "Complete" ? {
      ...props.project,
      styleInspiration: {
        link,
        platform: platforms.filter(item => item.active)[0].title,
        category: videotemplates.filter(item => item.active)[0].title
      },
      // category: category,
      editedProjects: editedProjects
    } : {
      ...props.project,
      styleInspiration: {
        link,
        platform: platforms.filter(item => item.active)[0].title,
        category: videotemplates.filter(item => item.active)[0].title
      },
      // category: category,
      content: newContent
    }
    props.setShowStyleModal(false);
    props.setLoading(true);
    props.dispatch(createProjectMedia(project, history, props.setLoading, props.user.userRole))
    if (editedProjects) {
      localStorage.removeItem("editedVideoComments");
    }
  };

  return (
    <div className="modal__wrapper" style={{ zIndex: localStorage.showDemoLayer === 'true' && '130' }}>
      <div className="style__modal">
        <div className="connectSocial__cross" onClick={() => props.setShowStyleModal(false)}>
          <Cancel fill="black" />
        </div>
        {showStyleOption ? <><h3>Style Inspiration</h3>
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
          <h5>Select template if applicable</h5>
          <div className="applicable_template">
            {videotemplates.map((videotemplate, i) => (
              <div className="template_modal" key={i} style={{
                border: `1px solid ${videotemplate.active ? "#3b8590" : '#36596a55'}`,
                backgroundColor: videotemplate.active ? '#3b85911a' : 'white'
              }}
                onClick={() => changeTemplate(i)}
              >
                <div className="modal__plans--tick" style={{ backgroundColor: videotemplate.active ? "#3b8590" : "rgba(133,134,149,0.1)" }}>
                  {videotemplate.active && <Tick fill="white" />}
                </div>
                <video width="100%" height="auto" autoPlay muted playsInline loop>
                 <source src={videotemplate.url} type="video/mp4"></source>
                </video>
              </div>
            ))}
          </div>

          {/* <h5>Project Category:</h5>
          <div className="pick__category">
            <select name="projectCategory"
              style={{border: errorCategory === 'select' ? "1px solid red":''}}
              onChange={e => {
                if (e.target.value === "Other") {
                  setCustomCategory(true);
                } else {
                  setCustomCategory(false);
                }
                setCategory(e.target.value);
                setErrorCategory(false);
              }} 
              required>
              <option disabled selected>Select your category</option>
              <option value="Products with person">Products with person</option>
              <option value="Products Alone">Products Alone</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Events">Events</option>
              <option value="Education">Education</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
            {customCategory === true
              &&
              <>
                <label style={{display: errorCategory === 'input' ? "initial":'none'}}>
                  Please type a category of your project
                </label>
                <input style={{border: errorCategory === 'input' ? "1px solid red":''}}
                  required
                  type="text"
                  placeholder="Type here"
                  onChange={e => setCategory(e.target.value.trim())} />
              </>
            }
          </div> */}
          
          {/* <h5>Any favourite relevant?</h5>
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
          </div> */}
          <button className="pay__modal--submit" type="button" onClick={handleDone}>Done</button>
        </> : <div className='warning-container'>
          <div className='massage'> You are about to submit your project for edits. You won't be able to update while it is being processed. Are you sure?</div>
          <div className="option">
            <button className='pay__modal--submit' onClick={() => props.setShowStyleModal(false)}> No</button>
            <button className='pay__modal--submit' onClick={() => setShowStyleOption(true)}>Yes</button>
          </div>
        </div>}
      </div>
    </div >
  );
};

const mapStateToProps = state => ({
  project: state.project.project
})

export default connect(mapStateToProps)(StyleInspirationModal);
