import React, {useState, useEffect} from 'react';
import {connect } from "react-redux";
import "./Projects.scss";
import { Elements } from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import {REACT_APP_STRIPE_API} from "../../utils/misc";
import PayAccessModal from "../Modals/PayAccessModal";
import PayWallModal from "../Modals/PayWallModal";
import {clearTempProject, getProjects} from "../../store/actions/project.action";
import moment from "moment";
import MoonLoader from "react-spinners/MoonLoader";

const stripePromise = loadStripe(REACT_APP_STRIPE_API);

const Projects = (props) => {
  
  const [showPayAccess, setShowPayAccess] = useState(false);
  const [showPayWall, setShowPayWall] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    localStorage.removeItem('duration');
    localStorage.removeItem('currentProjectId');
    localStorage.removeItem('currentMedia');
    localStorage.removeItem('comments');
  },[])
  
  useEffect(() => {
    if(props.user.userName) {
      !props.user.payments.length &&
      setTimeout(() => {
        setShowPayAccess(true);
      },500)
    }
  },[]);
  
  useEffect(() => {
    props.dispatch(getProjects(setLoading));
  },[props.projects.length]);
  
  useEffect(() => {
    if (props.projects) {
      setMyProjects(props.projects);
    }
  }, [props.projects, props.projects.length]);
  
  const deleteProjectHandle = (e, id, bucket) => {
    e.stopPropagation();
    props.dispatch(clearTempProject(id, bucket)).then((res) => {
      if (res) {
        props.dispatch(getProjects(setLoading));
      }
    });
    let newProjects = props.projects.filter(project => project._id !== id);
    setMyProjects(newProjects);
  }
  
  if(loading) return <div className="spinner__wrapper">
    <MoonLoader className="spinner" color="#000" loading={loading} size={50}/>
  </div>
  return (
    <div className="projects">
      {showPayAccess && <PayAccessModal setShowPayAccess={setShowPayAccess} setShowPayWall={setShowPayWall}/>}
      {showPayWall &&
      <Elements stripe={stripePromise}>
        <PayWallModal setShowPayWall={setShowPayWall} user={props.user}/>
      </Elements>}
      <h3>Your Projects</h3>
      <div className="projects__block">
        {myProjects.map((project,i) => (
          <div className="project__item" key={project._id}
               onClick={() => {
                 localStorage.currentProjectId = project._id;
                 localStorage.removeItem('currentMedia');
                 localStorage.removeItem('comments');
                 localStorage.removeItem('currentPublishedMedia');
                 localStorage.removeItem('duration');
                 props.history.push(`/dashboard/upload`)
               }}>
            <span className="delete__video--btn" onClick={e => deleteProjectHandle(e, project._id, project.bucket)}>X</span>
            <div className="project__item--image"
                 style={{background: project.content[0].screens.length > 1 ? `url(${project.content[0].screens[1].screenSrc}) no-repeat center center` : 'black'}}>
              <div className="project__item--theme">Theme {project.themeName}</div>
              <div className="project__item--plan">{props.user.paymentId ? 'Premium' : 'Free'}</div>
            </div>
            <span className="project__item--name"><strong>#{i + 1}</strong> {project.projectName}</span>
            {project.isPublished
              ?  <strong className="project__item--date">Created {moment(project.createdAt).format('Do MMMM, YYYY hh:mm a')}</strong>
              : <strong className="project__item--publish">In progress</strong>
  
            }
          </div>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user,
  projects: state.project.projects
})

export default connect(mapStateToProps)(Projects);

