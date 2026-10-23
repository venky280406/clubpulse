import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Imported Link for navigation

const API_URL = import.meta.env.VITE_API_URL;

export default function FeedbackForm() {
  const [formData, setFormData] = useState({ eventName: '', message: '', rating: 5 });
  const [events, setEvents] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  
  // Check if the admin is already logged in by looking for the token
  const isAdmin = !!localStorage.getItem('adminToken');

  useEffect(() => {
    axios.get(`${API_URL}/api/events`).then(res => setEvents(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/api/feedback`, formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ eventName: '', message: '', rating: 5 });
  };

  return (
    // Added 'relative' to the main wrapper so we can position the button in the corner
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      
      {/* Top Right Navigation Button */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <Link 
          to={isAdmin ? "/admin" : "/login"} 
          className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
        >
          {isAdmin ? "Admin Dashboard" : "Admin Login"}
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">ClubPulse Feedback</h2>
        {submitted ? (
          <div className="bg-green-100 text-green-700 p-4 rounded text-center">Thank you!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <select required className="w-full border p-2 rounded" value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})}>
              <option value="">Select Event...</option>
              {events.map(ev => <option key={ev._id} value={ev.name}>{ev.name}</option>)}
            </select>
            <input type="number" min="1" max="5" required className="w-full border p-2 rounded" placeholder="Rating 1-5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
            <textarea required rows="4" className="w-full border p-2 rounded" placeholder="Your thoughts..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            <button className="w-full bg-blue-600 text-white font-bold py-2 rounded">Submit Anonymously</button>
          </form>
        )}
      </div>
    </div>
  );
}