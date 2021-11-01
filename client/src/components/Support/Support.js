import React, {useState} from 'react';
import './Support.scss';
import arrowCircle from '../../assets/img/Circle.png'

const Support = () => {
  
  const options = ['Consectetur adipiscing elit ', 'category 2', 'category 3', 'category 4', 'category 5']
  
  const [request, setRequest] = useState('');
  const [category, setCategory] = useState(options[0]);
  const [questions, setQuestions] = useState([{
    title: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Convallis convallis tellus id interdum velit laoreet.',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean placerat augue vel mauris mollis aliquet. Proin quis mi vitae sem viverra eleifend eget nec nunc. Proin hendrerit velit et augue lacinia efficitur. Integer bibendum condimentum felis, vel congue leo tristique eget. Aenean est erat, blandit ut dolor ut, laoreet pellentesque metus. Cras lobortis blandit nunc in placerat. Nunc et tellus nunc. In maximus in nibh sit amet molestie. Praesent lacinia efficitur leo vitae imperdiet. Etiam placerat, diam non venenatis venenatis, tortor nunc rhoncus dui, ut fermentum massa arcu sit amet neque. Pellentesque in rutrum magna.',
    opened: false
  },{
    title: 'Vitae purus faucibus ornare suspendisse sed nisi lacus. Elit duis tristique sollicitudin nibh sit amet commodo nulla facilisi.',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean placerat augue vel mauris mollis aliquet. Proin quis mi vitae sem viverra eleifend eget nec nunc. Proin hendrerit velit et augue lacinia efficitur. Integer bibendum condimentum felis, vel congue leo tristique eget. Aenean est erat, blandit ut dolor ut, laoreet pellentesque metus. Cras lobortis blandit nunc in placerat. Nunc et tellus nunc. In maximus in nibh sit amet molestie. Praesent lacinia efficitur leo vitae imperdiet. Etiam placerat, diam non venenatis venenatis, tortor nunc rhoncus dui, ut fermentum massa arcu sit amet neque. Pellentesque in rutrum magna.',
    opened: false
  },{
    title: 'Habitant morbi tristique senectus et netus et malesuada fames ac. Cursus turpis massa tincidunt dui ut ornare lectus sit amet. ',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean placerat augue vel mauris mollis aliquet. Proin quis mi vitae sem viverra eleifend eget nec nunc. Proin hendrerit velit et augue lacinia efficitur. Integer bibendum condimentum felis, vel congue leo tristique eget. Aenean est erat, blandit ut dolor ut, laoreet pellentesque metus. Cras lobortis blandit nunc in placerat. Nunc et tellus nunc. In maximus in nibh sit amet molestie. Praesent lacinia efficitur leo vitae imperdiet. Etiam placerat, diam non venenatis venenatis, tortor nunc rhoncus dui, ut fermentum massa arcu sit amet neque. Pellentesque in rutrum magna.',
    opened: false
  }])
  
  const handleQuestions = i => {
    const newQuestions = [...questions];
    newQuestions[i].opened = !questions[i].opened;
    setQuestions(newQuestions);
  }
  
  return (
    <div className="support__block">
      <h3>Support</h3>
      <section>
        <div className="support__header">
          <h3>Submit Request</h3>
        </div>
        <div className="account_line"/>
        <form className="support__form" onSubmit={() => setRequest('')}>
          <label>
            <span>Description</span>
            <textarea
              placeholder="Lorem ipsum dolor sit amet, consectetur e suspendisse sed."
              rows="8"
              value={request}
              onChange={e => setRequest(e.target.value)}
            />
          </label>
          <div className="form__bottom">
            <label>
              <span>Category</span>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {options.map( opt => (
                  <option>{opt}</option>
                ))}
              </select>
            </label>
            <button type="submit">Submit</button>
          </div>
        </form>
      </section>
      
      <section>
        <div className="support__header">
          <h3>Frequently Asked Questions</h3>
        </div>
        <div className="account_line"/>
        <div className="support__questions">
          {questions.map((item, idx) => (
            <div className="support__question--item">
              <div className="support__question--title" onClick={() => handleQuestions(idx)}>
                <h5>{item.title}< /h5>
                <img src={arrowCircle} alt="arrow-circle" style={{transform: item.opened && 'rotate(180deg)'}}/>
              </div>
              {item.opened &&
                <>
                  <div className="account_line"/>
                  <div className="support__question--text">
                    {item.text}
                  </div>
                  <div className="account_line"/>
                </>
              }
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
};

export default Support;
