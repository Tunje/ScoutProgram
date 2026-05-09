import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Group } from '@/types';
import { ArrowLeft, Key, Users } from 'lucide-react';

export default function GroupRegistration() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [registrationCode, setRegistrationCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundGroup, setFoundGroup] = useState<Group | null>(null);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationCode.trim() || !projectId) return;

    setLoading(true);
    setError('');

    try {
      const q = query(
        collection(db, 'groups'),
        where('projectId', '==', projectId),
        where('registrationCode', '==', registrationCode.toUpperCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Invalid registration code. Please check and try again.');
        setLoading(false);
        return;
      }

      const groupDoc = snapshot.docs[0];
      const group = { id: groupDoc.id, ...groupDoc.data() } as Group;

      if (group.isClaimed) {
        setError(`This code has already been claimed by "${group.name}"`);
        setLoading(false);
        return;
      }

      setFoundGroup(group);
      setLoading(false);
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Error verifying code. Please try again.');
      setLoading(false);
    }
  };

  const handleRegisterGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !foundGroup) return;

    setLoading(true);
    setError('');

    try {
      await updateDoc(doc(db, 'groups', foundGroup.id), {
        name: groupName,
        isClaimed: true,
        claimedBy: auth.currentUser?.uid,
        claimedAt: Timestamp.now()
      });

      navigate(`/scan/${projectId}`);
    } catch (err) {
      console.error('Error registering group:', err);
      setError('Error registering group. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/scan/${projectId}`)}
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register Group</h1>
          <p className="text-gray-600">Enter your registration code to claim your group</p>
        </div>

        {!foundGroup ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Key size={18} />
                  Registration Code
                </label>
                <input
                  type="text"
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code..."
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-lg uppercase text-center"
                  autoFocus
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Ask your event organizer for the registration code
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || registrationCode.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Users size={20} />
                  Code Verified!
                </h3>
                <p className="text-sm text-green-800">
                  Kår: <strong>{foundGroup.kår}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterGroup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group/Patrol Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Eagles, Wolves, Patrol 1..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Choose a name for your group/patrol
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFoundGroup(null);
                    setRegistrationCode('');
                    setGroupName('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Registering...' : 'Register Group'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
