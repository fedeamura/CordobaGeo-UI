import Usuario from "./usuario";
import Alerta from "./alerta";

import { combineReducers } from "redux";

const rootReducer = combineReducers({
  Usuario,
  Alerta
});

export default rootReducer;
