import { useState } from "react";
import "./Support.scss";
import arrowCircle from "../../assets/img/Circle.png";
import { createSupportTicket } from "../../store/actions/support.action";
import { REACT_MONDAY_API_KEY, REACT_MONDAY_BOARD_ID } from "../../utils/misc";
import { toast } from "react-toastify";
import { connect } from "react-redux";

const Support = (props) => {
  const options = [
    "Select a Category",
    "Category 1",
    "Category 2",
    "Category 3",
    "Category 4",
  ];

  const categoryIds = {
    "Category 1": "topics",
    "Category 2": "group_title",
    "Category 3": "new_group",
    "Category 4": "new_group72639",
  };
  const [isSavingTicket, setIsSavingTicket] = useState(false);
  const [request, setRequest] = useState("");
  const [category, setCategory] = useState(options[0]);
  const [questions, setQuestions] = useState([
    {
      title: "How do I add more people to my team to view received footage?",
      text: "Contact us at contact@myvideospro.com.",
      opened: false,
    },
    {
      title: "How much does the service cost?",
      text: 'Only "video receivers" of footage pay. Receivers can send their connection code to as many "senders" as they want',
      opened: false,
    },
    {
      title:
        'How do editors or "video receivers" get footage from their "video senders" or clients?',
      text: '"Video receivers" share your connection code to your "video senders". When "video senders" log in they will be prompted to enter a connection code. This connection code will match "video senders" with "video receivers".',
      opened: false,
    },
    {
      title: "How do I send footage to my editor?",
      text: 'Upload footage. Press "Generate Video" and the video will be sent to your editor.',
      opened: false,
    },
    {
      title: "How do I receive a revision from my editor?",
      text: "Your editor's revisions will appear in the same place as your uploaded footage. The latest revision appears farthest to the right.",
      opened: false,
    },
  ]);

  const handleQuestions = (i) => {
    const newQuestions = [...questions];
    newQuestions[i].opened = !questions[i].opened;
    setQuestions(newQuestions);
  };

  const submitTicket = async (e) => {
    try {
      const { user } = props;
      const categoryId = categoryIds[category];
      e.preventDefault();
      if (!request) return toast.error("Your request must have a description");
      if (!categoryIds[category])
        return toast.error("Please select a category");

      setIsSavingTicket(true);
      const data = { request, category, user, categoryId };
      const didSubmit = await props.dispatch(createSupportTicket(data));
      if (!didSubmit)
        return toast.error("Something went wrong, please try again");

      toast.success("Your request has been successfully submitted");
      setRequest("");
      setCategory(options[0]);
      setIsSavingTicket(false);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, please try again");
    }
  };

  return (
    <div className="support__block">
      <h3>Support</h3>
      <section>
        <div className="support__header">
          <h3>Submit Request</h3>
        </div>
        <div className="account_line" />
        <form className="support__form" method="POST" onSubmit={submitTicket}>
          <label>
            <span>Description</span>
            <textarea
              placeholder="Lorem ipsum dolor sit amet, consectetur e suspendisse sed."
              rows="8"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
            />
          </label>
          <div className="form__bottom">
            <label>
              <span>Category</span>
              <select
                defaultValue={"Select a Category"}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {options.map((opt, index) => {
                  if (index === 0) {
                    return (
                      <option disabled key={opt}>
                        {opt}
                      </option>
                    );
                  }
                  return <option key={opt}>{opt}</option>;
                })}
              </select>
            </label>
            <button disabled={isSavingTicket} type="submit">
              {!isSavingTicket && <span>Submit</span>}
              {isSavingTicket && <span class="loader"></span>}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="support__header">
          <h3>Frequently Asked Questions</h3>
        </div>
        <div className="account_line" />
        <div className="support__questions">
          {questions.map((item, idx) => (
            <div className="support__question--item">
              <div
                className="support__question--title"
                onClick={() => handleQuestions(idx)}
              >
                <h5>{item.title}</h5>
                <img
                  src={arrowCircle}
                  alt="arrow-circle"
                  style={{ transform: item.opened && "rotate(180deg)" }}
                />
              </div>
              {item.opened && (
                <>
                  <div className="account_line" />
                  <div className="support__question--text">{item.text}</div>
                  <div className="account_line" />
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default connect()(Support);
