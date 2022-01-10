import { REACT_MONDAY_BOARD_ID, REACT_MONDAY_API_KEY } from "../../utils/misc";
import setAuthToken from "../../utils/authToken";
import crypto from "crypto";

export const createSupportTicket = (data) => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
    try {
      const { request, category, user, categoryId } = data;
      const now = new Date();
      now.setHours(now.getHours() + 5);

      const newYorkTime = now.toLocaleDateString("en-CA", {
        timeZone: "America/New_york",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        second: "2-digit",
      });

      const date = newYorkTime.split(", ")[0];
      const time = newYorkTime.split(", ")[1];

      const body = {
        query: `
        mutation ($boardId: Int!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
          create_item (
            board_id: $boardId,
            group_id: $groupId,
            item_name: $itemName,
            column_values: $columnValues
          ) {
            id
          }
        }
        `,
        variables: {
          boardId: REACT_MONDAY_BOARD_ID,
          groupId: categoryId,
          itemName: crypto.randomBytes(4).toString("hex"),
          columnValues: JSON.stringify({
            text: request,
            text1: category,
            email5: {
              email: user.email,
              text: user.email,
              changed_at: now,
            },
            status: "Open",
            text0: user.userName,
            date: {
              date,
              time,
              changed_at: now.toISOString(),
            },
            text6: `${user.firstName}  ${user.lastName}`,
          }),
        },
      };

      let response = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: REACT_MONDAY_API_KEY,
        },
        body: JSON.stringify(body),
      });

      response = await response.json();
      console.log(response);

      dispatch({
        type: "CREATE_TICKET",
        payload: response.data,
      });
      return response.data;
    } catch (error) {
      console.log(error);
      dispatch({
        type: "CREATE_TICKET_ERROR",
      });
    }
  }
};
