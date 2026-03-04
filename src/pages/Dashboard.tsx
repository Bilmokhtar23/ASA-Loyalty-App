import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Star, Gift, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hello, {user.name.split(' ')[0]}!</h2>
          <p className="text-gray-500">Ready to earn some rewards?</p>
        </div>
        <Link to="/card" className="shrink-0">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Star className="w-6 h-6 fill-current" />
          </div>
        </Link>
      </div>

      {/* Points Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Current Balance</p>
            <h3 className="text-4xl font-bold">{user.points_balance}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Gift className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-emerald-50">
          <span>Membership Active</span>
          <Link to="/rewards" className="flex items-center hover:text-white transition-colors">
            Redeem Points <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/events" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors group">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-gray-900">Events</h4>
          <p className="text-xs text-gray-500 mt-1">Check upcoming meetups</p>
        </Link>
        <Link to="/partners" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-emerald-200 transition-colors group">
          <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-3 group-hover:bg-orange-100 transition-colors">
            <Star className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-gray-900">Partners</h4>
          <p className="text-xs text-gray-500 mt-1">Discover student deals</p>
        </Link>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-emerald-600 font-medium">View All</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  EV
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Event Attendance</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600">+50</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
