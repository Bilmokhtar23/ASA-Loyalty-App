import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function EventCheckIn() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; points?: number } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
  }, []);

  async function onScanSuccess(decodedText: string, decodedResult: any) {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    try {
      const res = await fetch('/api/events/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qr_code: decodedText })
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult({ success: true, message: data.message, points: data.points });
      } else {
        setScanResult({ success: false, message: data.message || 'Check-in failed' });
      }
    } catch (error) {
      setScanResult({ success: false, message: 'Network error' });
    }
  }

  function onScanFailure(error: any) {
    // handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Scan Event Code</h2>
        <p className="text-gray-500">Point your camera at the event QR code</p>
      </div>

      {!scanResult ? (
        <div className="w-full max-w-sm bg-black rounded-xl overflow-hidden shadow-lg">
          <div id="reader" className="w-full"></div>
        </div>
      ) : (
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${scanResult.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {scanResult.success ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {scanResult.success ? 'Success!' : 'Oops!'}
            </h3>
            <p className="text-gray-600 mt-1">{scanResult.message}</p>
            {scanResult.points && (
              <p className="text-emerald-600 font-bold mt-2">+{scanResult.points} Points Earned</p>
            )}
          </div>

          <button 
            onClick={() => navigate('/events')}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Events
          </button>
        </div>
      )}
    </div>
  );
}
