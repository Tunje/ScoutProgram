import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Control, PointCategory } from '@/types';
import { ArrowLeft, Save, QrCode as QrCodeIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ControlCreator() {
  const { projectId, controlId } = useParams<{ projectId: string; controlId?: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [controlCode, setControlCode] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [hasPoints, setHasPoints] = useState(true);

  const generateControlCode = async (): Promise<string> => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars
    
    // Keep generating until we find a unique code within this project
    while (true) {
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if this code already exists in THIS project
      const q = query(
        collection(db, 'controls'),
        where('projectId', '==', projectId),
        where('controlCode', '==', code)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return code; // Unique code found within this project!
      }
      // If code exists in this project, loop continues and generates a new one
    }
  };
  const [pointsValue, setPointsValue] = useState(10);
  const [pointCategories, setPointCategories] = useState<PointCategory[]>([]);
  const [hasTimer, setHasTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(5);
  const [loading, setLoading] = useState(false);

  const addPointCategory = () => {
    setPointCategories([...pointCategories, { name: '', maxPoints: 10 }]);
  };

  const updatePointCategory = (index: number, field: 'name' | 'maxPoints', value: string | number) => {
    const updated = [...pointCategories];
    if (field === 'name') {
      updated[index].name = value as string;
    } else {
      updated[index].maxPoints = value as number;
    }
    setPointCategories(updated);
  };

  const removePointCategory = (index: number) => {
    setPointCategories(pointCategories.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (controlId) {
      const fetchControl = async () => {
        const controlDoc = await getDoc(doc(db, 'controls', controlId));
        if (controlDoc.exists()) {
          const data = controlDoc.data() as Control;
          setName(data.name);
          setControlCode(data.controlCode);
          setDisplayText(data.displayText);
          setHasPoints(data.hasPoints);
          if (data.pointsValue) setPointsValue(data.pointsValue);
          if (data.pointCategories) setPointCategories(data.pointCategories);
          setHasTimer(data.hasTimer);
          if (data.timerConfig) setTimerDuration(data.timerConfig.durationMinutes);
        }
      };
      fetchControl();
    } else {
      // Generate code for new control
      const initCode = async () => {
        const code = await generateControlCode();
        setControlCode(code);
      };
      initCode();
    }
  }, [controlId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setLoading(true);
    try {
      const controlData: any = {
        projectId,
        name,
        controlCode,
        displayText,
        hasPoints,
        hasTimer,
        createdAt: Timestamp.now()
      };

      if (hasPoints) {
        controlData.pointsValue = pointsValue;
        if (pointCategories.length > 0) {
          controlData.pointCategories = pointCategories;
        }
      }
      
      if (hasTimer) {
        controlData.timerConfig = { durationMinutes: timerDuration };
      }

      if (controlId) {
        await updateDoc(doc(db, 'controls', controlId), controlData);
      } else {
        await addDoc(collection(db, 'controls'), controlData);
      }

      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('Error saving control:', error);
    } finally {
      setLoading(false);
    }
  };

  // QR code contains just the control ID for the mobile app to read
  const qrCodeData = controlId || 'preview';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={`/project/${projectId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {controlId ? 'Edit Control' : 'Create New Control'}
          </h1>
          <p className="text-gray-600">Configure control settings and generate QR code</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Control Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Control Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Checkpoint 1, Start Line, Finish"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Control Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={controlCode}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg text-center"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const code = await generateControlCode();
                      setControlCode(code);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leaders can type this code to access the control without scanning
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Text
                </label>
                <textarea
                  value={displayText}
                  onChange={(e) => setDisplayText(e.target.value)}
                  placeholder="Message to show when scanned..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasPoints"
                    checked={hasPoints}
                    onChange={(e) => setHasPoints(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="hasPoints" className="text-sm font-medium text-gray-700">
                    Award Points
                  </label>
                </div>

                {hasPoints && (
                  <div className="ml-7 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fixed Points Value
                      </label>
                      <input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(parseInt(e.target.value))}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Automatic points awarded (set to 0 if using categories only)
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Point Categories (Leader Awards)
                        </label>
                        <button
                          type="button"
                          onClick={addPointCategory}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          + Add Category
                        </button>
                      </div>
                      {pointCategories.map((category, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updatePointCategory(index, 'name', e.target.value)}
                            placeholder="e.g., Cooperation"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <input
                            type="number"
                            value={category.maxPoints}
                            onChange={(e) => updatePointCategory(index, 'maxPoints', parseInt(e.target.value))}
                            min="1"
                            max="100"
                            placeholder="Max"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removePointCategory(index)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {pointCategories.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Leaders will award points in these categories when scanning
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasTimer"
                    checked={hasTimer}
                    onChange={(e) => setHasTimer(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="hasTimer" className="text-sm font-medium text-gray-700">
                    Countdown Timer
                  </label>
                </div>

                {hasTimer && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Timer will count down from this duration when scanned
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Save size={20} />
                {loading ? 'Saving...' : controlId ? 'Update Control' : 'Create Control'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <QrCodeIcon size={24} />
              QR Code Preview
            </h2>

            <div className="bg-gray-50 rounded-lg p-8 mb-6">
              <div className="bg-white p-6 rounded-lg inline-block mx-auto">
                <QRCodeSVG
                  value={qrCodeData}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Control Information</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {name || 'Not set'}</p>
                  <p><strong>Code:</strong> <span className="font-mono text-lg">{controlCode}</span></p>
                  {hasPoints && (
                    <>
                      {pointsValue > 0 && <p><strong>Fixed Points:</strong> {pointsValue}</p>}
                      {pointCategories.length > 0 && (
                        <div>
                          <p><strong>Categories:</strong></p>
                          <ul className="ml-4 list-disc">
                            {pointCategories.map((cat, i) => (
                              <li key={i}>{cat.name}: max {cat.maxPoints}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                  {hasTimer && <p><strong>Timer:</strong> {timerDuration} minutes countdown</p>}
                  {!hasPoints && !hasTimer && <p><strong>Type:</strong> Display only</p>}
                </div>
              </div>

              {controlId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Print Instructions</h3>
                  <p className="text-sm text-green-800 mb-3">
                    Right-click the QR code and select "Save image" or use your browser's print function.
                  </p>
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Print QR Code
                  </button>
                </div>
              )}

              {!controlId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Save the control first to generate a permanent QR code that can be printed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
