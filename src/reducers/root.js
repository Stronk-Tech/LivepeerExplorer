import { combineReducers } from "redux";
import errors from "./errors/errors";
import livepeerstate from "./livepeer/livepeerstate";
export default combineReducers({
  errors,
  livepeerstate
});