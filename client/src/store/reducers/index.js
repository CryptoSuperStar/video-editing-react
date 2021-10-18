import { combineReducers } from 'redux';
import auth from './auth_reducer.js';
import project from './project_reducer';

const rootReducer = combineReducers({
  auth,
  project
});

export default rootReducer;