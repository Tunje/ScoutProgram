import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Group, Control } from '@/types';
import { ArrowLeft, Camera, CheckCircle, Users } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [lastScan, setLastScan] = useState<{ control: Control; success: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'groups'), 
      where('projectId', '==', projectId),
      where('isClaimed', '==', true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const startScanning = async () => {
    if (!selectedGroup) {
      alert('Please select a group first!');
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        () => {}
      );

      setScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopScanning = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setScanning(false);
    setScanner(null);
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!selectedGroup || !projectId) return;

    try {
      const url = new URL(decodedText);
      const controlId = url.searchParams.get('control');

      if (!controlId) {
        alert('Invalid QR code');
        return;
      }

      const controlDoc = await getDoc(doc(db, 'controls', controlId));
      if (!controlDoc.exists()) {
        alert('Control not found');
        return;
      }

      const control = { id: controlDoc.id, ...controlDoc.data() } as Control;

      if (control.projectId !== projectId) {
        alert('This control belongs to a different project');
        return;
      }

      const scanData: any = {
        projectId,
        groupId: selectedGroup.id,
        controlId: control.id,
        scannedBy: auth.currentUser?.uid || 'unknown',
        scannedAt: Timestamp.now()
      };

      if (control.type === 'points' && control.pointsValue) {
        scanData.pointsAwarded = control.pointsValue;
      } else if (control.type === 'timer' && control.timerConfig) {
        scanData.timerData = {
          action: control.timerConfig.type,
          timestamp: Timestamp.now()
        };
      }

      await addDoc(collection(db, 'scans'), scanData);

      setLastScan({ control, success: true });

      await stopScanning();

      setTimeout(() => {
        setLastScan(null);
      }, 5000);

    } catch (error) {
      console.error('Error processing scan:', error);
      alert('Error processing scan. Please try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scan Controls</h1>
          <p className="text-gray-600">Select a group and scan QR codes</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users size={24} />
              Select Group
            </h2>
            <Link
              to={`/register/${projectId}`}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Register New
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">No registered groups yet</p>
              <Link
                to={`/register/${projectId}`}
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Register Your Group
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedGroup?.id === group.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="font-medium text-gray-900">{group.name}</span>
                  </div>
                  {selectedGroup?.id === group.id && (
                    <CheckCircle size={16} className="text-green-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {lastScan && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={32} className="text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Scan Successful!</h3>
            </div>
            <div className="text-green-800">
              <p className="font-semibold">{lastScan.control.name}</p>
              <p className="text-sm">{lastScan.control.displayText}</p>
              {lastScan.control.type === 'points' && lastScan.control.pointsValue && (
                <p className="text-lg font-bold mt-2">+{lastScan.control.pointsValue} points</p>
              )}
              {lastScan.control.type === 'timer' && lastScan.control.timerConfig && (
                <p className="text-lg font-bold mt-2 capitalize">{lastScan.control.timerConfig.type} Timer</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera size={24} />
            QR Scanner
          </h2>

          {!scanning ? (
            <div className="text-center py-12">
              <Camera size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-6">
                {selectedGroup
                  ? `Ready to scan for ${selectedGroup.name}`
                  : 'Select a group to start scanning'}
              </p>
              <button
                onClick={startScanning}
                disabled={!selectedGroup}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                Start Scanning
              </button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="mb-4 rounded-lg overflow-hidden"></div>
              <button
                onClick={stopScanning}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Stop Scanning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
