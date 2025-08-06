import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ name: '', location: '', message: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/messages')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/send-message', form);
    setForm({ name: '', location: '', message: '' });
    const res = await axios.get('http://localhost:5000/messages');
    setData(res.data);
  };

  return (
    <div className="App">
      <h1>Disaster Management Portal</h1>
      <form onSubmit={handleSubmit}>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location" required />
        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Message" required />
        <button type="submit">Send Message</button>
      </form>

      <h2>Live Updates</h2>
      {data.map((msg, index) => (
        <div key={index}>
          <h4>{msg.name} ({msg.location})</h4>
          <p>{msg.message}</p>
          <small>{new Date(msg.time).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default App;
