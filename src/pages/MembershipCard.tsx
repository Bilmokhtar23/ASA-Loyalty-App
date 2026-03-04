import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function MembershipCard() {
  const { user } = useAuth();

  if (!user) return null;

  // Generate a secure payload for the QR code
  // In a real app, this might be a signed JWT or a temporary token
  const qrPayload = JSON.stringify({
    userId: user.id,
    type: 'membership',
    timestamp: Date.now(),
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Digital ID</h2>
        <p className="text-gray-500">Show this code at events & partners</p>
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Card Header */}
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h3 className="font-bold text-xl">Arab Student Association</h3>
          <p className="text-emerald-100 text-sm">Amsterdam Chapter</p>
        </div>

        {/* QR Code Area */}
        <div className="p-8 flex flex-col items-center justify-center bg-white">
          <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
            <QRCodeSVG 
              value={qrPayload} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="mt-4 text-xs text-gray-400 font-mono">ID: {user.id.toString().padStart(6, '0')}</p>
        </div>

        {/* User Details */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Member Name</span>
            <span className="font-medium text-gray-900">{user.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
              {user.membership_status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Points Balance</span>
            <span className="font-bold text-emerald-600">{user.points_balance}</span>
          </div>
        </div>
      </motion.div>

      <div className="text-center text-sm text-gray-400">
        <p>This card updates automatically.</p>
      </div>
    </div>
  );
}
