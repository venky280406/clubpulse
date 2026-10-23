import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [data, setData] = useState({ feedbacks: [], stats: {} });
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/');
    axios.get(`${API_URL}/api/admin/data`, getAuthHeader())
      .then(res => setData(res.data))
      .catch(() => navigate('/login'));
    axios.get(`${API_URL}/api/events`).then(res => setEvents(res.data));
  }, [navigate]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/admin/events`, { name: newEvent }, getAuthHeader());
      setEvents([res.data, ...events]);
      setNewEvent('');
    } catch (err) { alert('Failed to create event'); }
  };

  // 1. First, filter the feedbacks based on the dropdown selection
  const displayFeedbacks = filter === 'All' 
    ? data.feedbacks 
    : data.feedbacks.filter(f => f.eventName === filter);

  // 2. Dynamically calculate the stats based ONLY on the filtered feedbacks
  const currentTotal = displayFeedbacks.length;
  const currentAvgRating = currentTotal === 0 
    ? 0 
    : (displayFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / currentTotal).toFixed(1);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button 
            onClick={() => {
                localStorage.removeItem('adminToken');
                navigate('/');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* 3. Update the UI to show the dynamic stats instead of the global backend stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
          <span className="text-gray-500 text-sm">Total Feedback</span>
          <div className="text-2xl font-bold">{currentTotal}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
          <span className="text-gray-500 text-sm">Average Rating</span>
          <div className="text-2xl font-bold">{currentAvgRating} <span className="text-sm font-normal text-gray-400">/ 5</span></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <form onSubmit={handleCreateEvent} className="flex gap-4">
          <input type="text" placeholder="New Event Name" required className="flex-1 border p-2 rounded" value={newEvent} onChange={e => setNewEvent(e.target.value)} />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors">Create Event</button>
        </form>
      </div>

      <select className="border p-3 rounded w-full bg-white shadow cursor-pointer" value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="All">Filter by Event (All)</option>
        {events.map(ev => <option key={ev._id} value={ev.name}>{ev.name}</option>)}
      </select>

      <div className="space-y-4">
        {displayFeedbacks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No feedback yet for this event.</p>
        ) : (
          displayFeedbacks.map(fb => (
            <div key={fb._id} className="bg-white p-4 rounded shadow border border-gray-100">
              <div className="flex justify-between font-bold mb-2">
                <span className="text-blue-600">{fb.eventName}</span>
                <span className="text-yellow-500 bg-yellow-50 px-2 py-1 rounded text-sm">{fb.rating} / 5</span>
              </div>
              <p className="text-gray-700">{fb.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}