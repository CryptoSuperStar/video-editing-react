const initialState = {
  ticket: {
    message: "",
    userName: "",
    fullname: null,
    category: null,
    ticketStatus: "",
  },
  isAuthenticated: false,
  loading: false,
};

const supportReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "CREATE_TICKET":
      return {
        ...state,
        ticket: payload,
      };
    default:
      return state;
  }
};

export default supportReducer;
