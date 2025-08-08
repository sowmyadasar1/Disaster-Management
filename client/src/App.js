import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', message: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/messages/messages')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Submitting form data:", form);

  try {
    await axios.post('http://localhost:5000/api/messages/send-message', form);
    setForm({ name: '', location: '', message: '' });

    const res = await axios.get('http://localhost:5000/api/messages/messages');
    setData(res.data);
  } catch (err) {
    console.error("Error sending message:", err);
  }
};


  return (
    <div className="App">
      <h1>Disaster Management Portal</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          name="location"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          placeholder="Location"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder="Message"
          required
        />
        <button type="submit">Send Message</button>
      </form>


      <h2>Live Updates</h2>
      {data.map((msg, index) => (
        <div key={index}>
          <h4>{msg.name} ({msg.location})</h4>
          <p>{msg.message}</p>
          <small>{new Date(msg.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default App;
