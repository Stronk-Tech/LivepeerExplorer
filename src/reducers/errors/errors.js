import { CLEAR_ERRORS, RECEIVE_ERRORS, RECEIVE_NOTIFICATIONS } from "../../actions/error";

export default (state = [], { message, type }) => {
  Object.freeze(state);
  switch (type) {
    case RECEIVE_ERRORS:
      return [...state, {
        title: "Foutmelding",
        message: message,
      }
      ];
    case RECEIVE_NOTIFICATIONS:
      return [...state, {
        title: message.title,
        message: message.message,
      }
      ];
    case CLEAR_ERRORS:
      return [];
    default:
      return state;
  }
};