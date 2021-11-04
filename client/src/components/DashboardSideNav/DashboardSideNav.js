import React, {useEffect, useRef} from 'react';
import { NavLink } from "react-router-dom";
import "./DashboardSideNav.scss";
import {ReactComponent as DashboardIcon} from "../../assets/img/dashboard.svg";
import {ReactComponent as AccountIcon} from "../../assets/img/friends.svg";
import {ReactComponent as ProjectsIcon} from "../../assets/img/search.svg";
import {ReactComponent as SettingsIcon} from "../../assets/img/settings.svg";
import {ReactComponent as PolicyIcon} from "../../assets/img/agreement-terms.svg";
import {ReactComponent as Plus} from "../../assets/img/add.svg";
import {ReactComponent as PhoneIcon} from "../../assets/img/phone.svg";

const DashboardSideNav = () => {
  
  let sideDash = useRef(null);
  
  useEffect(() => {
    localStorage.sideWidth = sideDash.current.offsetWidth ? sideDash.current.offsetWidth : 0;
  }, [sideDash.current]);
  
  return (
    <div className="dashboard_nav" ref={sideDash}>
      <strong className="web__view">Main</strong>
      <NavLink to="/dashboard/upload" className="web__view">
        <DashboardIcon />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/dashboard/account" >
        <AccountIcon />
        <span>Account</span>
      </NavLink>
      <NavLink to="/dashboard/upload" className="menu__upload--button">
        <Plus />
        <span>Upload</span>
      </NavLink>
      <NavLink to="/dashboard/projects" >
        <ProjectsIcon />
        <span>Projects</span>
      </NavLink>
      {/*<NavLink to="/dashboard/settings" className="web__view">
        <SettingsIcon />
        <span>Settings</span>
      </NavLink>*/}
      <NavLink to="/dashboard/support" className="web__view">
        <PhoneIcon fill="white"/>
        <span>Support</span>
      </NavLink>
      {/*<NavLink to="/term_conds_policy" className="web__view">
        <PolicyIcon />
        <span>Policy</span>
      </NavLink>*/}
    </div>
  );
};

export default DashboardSideNav;
