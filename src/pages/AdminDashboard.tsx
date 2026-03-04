import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Calendar, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type Event = {
  id: number;
  name: string;
  date: string;
  points_reward: number;
  qr_code: string;
};

type Member = {
  id: number;
  name: string;
  email: string;
  points_balance: number;
  membership_status: string;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'members'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  useEffect(() => {
    if (activeTab === 'events') {
      fetch('/api/events').then(res => res.json()).then(setEvents);
    } else {
      // Fetch members (need to implement API)
      fetch('/api/admin/members', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()).then(setMembers);
    }
  }, [activeTab]);

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    // Generate a random QR code string if not provided
    const qrCode = `EVENT_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...data, qr_code: qrCode })
      });
      
      if (res.ok) {
        setShowCreateEvent(false);
        fetch('/api/events').then(res => res.json()).then(setEvents);
      }
    } catch (error) {
      console.error('Failed to create event', error);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-4 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        {activeTab === 'events' && (
          <button 
            onClick={() => setShowCreateEvent(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> New Event
          </button>
        )}
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${activeTab === 'events' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar className="w-4 h-4" /> Events
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 ${activeTab === 'members' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4" /> Members
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="space-y-4">
          {showCreateEvent && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 mb-4">
              <h3 className="font-bold mb-4">Create New Event</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <input name="name" placeholder="Event Name" required className="w-full px-3 py-2 border rounded-lg" />
                <input name="description" placeholder="Description" required className="w-full px-3 py-2 border rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="date" type="datetime-local" required className="w-full px-3 py-2 border rounded-lg" />
                  <input name="points_reward" type="number" placeholder="Points" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <input name="location" placeholder="Location" required className="w-full px-3 py-2 border rounded-lg" />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowCreateEvent(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Create</button>
                </div>
              </form>
            </div>
          )}

          {events.map(event => (
            <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{event.name}</h3>
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">+{event.points_reward} pts</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <QRCodeSVG value={event.qr_code} size={64} />
                <span className="text-[10px] text-gray-400 font-mono">Scan to Check-in</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{member.points_balance} pts</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${member.membership_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {member.membership_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
