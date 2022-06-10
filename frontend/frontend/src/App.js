// import logo from './logo.svg';
import axios from "axios";
import format from "date-fns";
import "./App.css";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import faker from "@faker-js/faker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      // position: 'top' as const,
    },
    title: {
      display: true,
      text: "Chart.js Line Chart",
    },
  },
};

const baseURL = "http://localhost:5000";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [eventsList, setEventsList] = useState([]);

  const handleLogin = () => {
    const opts = {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    };
    fetch("http://localhost:5000/token")
      .then((resp) => {
        if (resp.status == 200) {
          return resp.json();
        } else {
          alert(`error ${resp.status}`);
        }
      })
      .then()
      .catch((error) => console.log(`There was an error ${error}`));
  };

  const fetchEvents = async () => {
    try {
      const rqst = `${baseURL}/events`;
      const data = await axios.get(rqst);

      console.log(data);
      const { events } = data.data;
      setEventsList(events);
      console.log(events);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const rqst = `${baseURL}/event/${id}`;
      const data = await axios.delete(rqst);
      const updatedList = eventsList.filter((event) => event.id != id);
      setEventsList(updatedList);
      console.log(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEntryChange = (e) => {
    setContent(e.target.value);
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(content);
      const data = await axios.post(`${baseURL}/event`, { content });
      console.log(data);
      setEventsList([...eventsList], data.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const labels = eventsList.map((event) => event.created_at);

  const data = {
    labels,
    datasets: [
      {
        label: "Positivity",
        data: eventsList.map((event) => event.pos),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Negativity",
        data: eventsList.map((event) => event.neg),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="App">
      <header className="App-header">
        <Line options={options} data={data} />;
        <section>
          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input onChange={handleUsernameChange} />
            <label>Password</label>
            <input onChange={handlePasswordChange} />
            <button type="submit">Submit </button>
          </form>
        </section>
        <section>
          <button onClick={fetchEvents}>Refresh Events</button>
          <ul>
            {eventsList.map((event) => {
              return (
                <li>
                  {event.content}
                  <button
                    onClick={() => {
                      handleDelete(event.id);
                    }}
                  >
                    x
                  </button>
                  <div>positivity score: {event.pos}</div>
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <form onSubmit={handleEntrySubmit}>
            <label htmlFor="content">Content</label>
            <input
              onChange={handleEntryChange}
              type="text"
              name="content"
              id="content"
              value={content}
            />
            <button type="submit">Submit </button>
          </form>
        </section>
      </header>
    </div>
  );
}

export default App;
