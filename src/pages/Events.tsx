import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, QrCode } from 'lucide-react';
import { format } from 'date-fns';

type Event = {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  points_reward: number;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        <Link 
          to="/check-in" 
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          Scan to Check In
        </Link>
      </div>

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  +{event.points_reward}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{format(new Date(event.date), 'MMM d, h:mm a')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No upcoming events found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
