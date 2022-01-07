import { combineReducers } from "redux";
import auth from "./auth_reducer.js";
import project from "./project_reducer";
import supportReducer from "./support_reducer.js";

const rootReducer = combineReducers({
  auth,
  project,
  supportReducer,
});

export default rootReducer;
