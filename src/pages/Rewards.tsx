import { useState } from 'react';
import { Gift, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Reward = {
  id: number;
  name: string;
  points_cost: number;
  description: string;
  image_url?: string;
};

const MOCK_REWARDS: Reward[] = [
  { id: 1, name: 'Free Cappuccino', points_cost: 200, description: 'Redeem at Sahara Cafe', image_url: 'https://picsum.photos/seed/coffee/200/200' },
  { id: 2, name: 'Free Shawarma', points_cost: 400, description: 'Redeem at Cairo Kitchen', image_url: 'https://picsum.photos/seed/shawarma/200/200' },
  { id: 3, name: 'Event Ticket', points_cost: 300, description: 'Free entry to next social', image_url: 'https://picsum.photos/seed/ticket/200/200' },
];

export default function Rewards() {
  const { user } = useAuth();
  const [rewards] = useState<Reward[]>(MOCK_REWARDS);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
        <p className="text-gray-500">Spend your hard-earned points</p>
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Your Balance</p>
          <p className="text-2xl font-bold text-emerald-600">{user.points_balance} pts</p>
        </div>
        <Gift className="w-8 h-8 text-emerald-200" />
      </div>

      <div className="grid gap-4">
        {rewards.map(reward => {
          const canAfford = user.points_balance >= reward.points_cost;
          return (
            <div key={reward.id} className={`bg-white rounded-xl p-4 shadow-sm border ${canAfford ? 'border-gray-100' : 'border-gray-100 opacity-75'}`}>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                  <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-gray-900">{reward.name}</h3>
                  <p className="text-sm text-gray-500">{reward.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-emerald-600">{reward.points_cost} pts</span>
                    <button 
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        canAfford 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem' : <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
