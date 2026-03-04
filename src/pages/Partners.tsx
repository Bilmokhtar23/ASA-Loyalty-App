import { useEffect, useState } from 'react';
import { MapPin, Tag } from 'lucide-react';

type Partner = {
  id: number;
  name: string;
  type: string;
  address: string;
  description: string;
  image_url: string;
};

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        setPartners(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading partners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Partner Deals</h2>
        <p className="text-gray-500">Exclusive discounts for members</p>
      </div>

      <div className="grid gap-6">
        {partners.map(partner => (
          <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-200 relative">
              <img 
                src={partner.image_url} 
                alt={partner.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-800 uppercase tracking-wide">
                {partner.type}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{partner.name}</h3>
                <p className="text-sm text-gray-500">{partner.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{partner.address}</span>
              </div>

              <div className="pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                  <Tag className="w-4 h-4" />
                  <span>10% Discount for Members</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
