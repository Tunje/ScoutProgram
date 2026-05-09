import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Group, Control } from '@/types';
import { ArrowLeft, Plus, Users, QrCode, Trash2, Trophy } from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [newGroupKår, setNewGroupKår] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
      }
    };

    fetchProject();

    const groupsQuery = query(collection(db, 'groups'), where('projectId', '==', projectId));
    const unsubGroups = onSnapshot(groupsQuery, (snapshot) => {
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
    });

    const controlsQuery = query(collection(db, 'controls'), where('projectId', '==', projectId));
    const unsubControls = onSnapshot(controlsQuery, (snapshot) => {
      const controlsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Control[];
      setControls(controlsData);
    });

    return () => {
      unsubGroups();
      unsubControls();
    };
  }, [projectId]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupKår.trim() || !projectId) return;

    try {
      await addDoc(collection(db, 'groups'), {
        projectId,
        name: 'Unclaimed',
        kår: newGroupKår,
        registrationCode: generateCode(),
        isClaimed: false,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        createdAt: Timestamp.now()
      });
      setNewGroupKår('');
      setShowNewGroup(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleDeleteControl = async (controlId: string) => {
    if (!confirm('Are you sure you want to delete this control?')) return;
    try {
      await deleteDoc(doc(db, 'controls', controlId));
    } catch (error) {
      console.error('Error deleting control:', error);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <div className="mb-3">
                <span className="text-sm text-gray-600 mr-2">Project Code:</span>
                <span className="text-lg font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">
                  {project.projectCode}
                </span>
              </div>
              <p className="text-gray-600">Manage groups and controls for this project</p>
            </div>
            <Link
              to={`/project/${projectId}/leaderboard`}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg"
            >
              <Trophy size={20} />
              View Leaderboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Users size={24} />
                Groups
              </h2>
              <button
                onClick={() => setShowNewGroup(!showNewGroup)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                Add Group
              </button>
            </div>

            {showNewGroup && (
              <form onSubmit={handleCreateGroup} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupKår}
                    onChange={(e) => setNewGroupKår(e.target.value)}
                    placeholder="Kår name (e.g., Kåren Blå)..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Create Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewGroup(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-2 opacity-50" />
                <p>No group slots yet. Create your first slot!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      group.isClaimed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {group.isClaimed ? group.name : 'Unclaimed'}
                          </div>
                          <div className="text-sm text-gray-600">Kår: {group.kår}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300">
                        {group.registrationCode}
                      </span>
                      {group.isClaimed ? (
                        <span className="text-green-700 font-medium">✓ Claimed</span>
                      ) : (
                        <span className="text-gray-500">Waiting for registration</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <QrCode size={24} />
                Controls
              </h2>
              <Link
                to={`/project/${projectId}/control/new`}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                New Control
              </Link>
            </div>

            {controls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                <p>No controls yet. Create your first control!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {controls.map((control) => (
                  <div
                    key={control.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{control.name}</div>
                      <div className="text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{control.controlCode}</span>
                        <span className="mx-1">•</span>
                        {control.hasPoints && control.pointsValue && (
                          <span>{control.pointsValue} points</span>
                        )}
                        {control.hasPoints && control.hasTimer && <span className="mx-1">•</span>}
                        {control.hasTimer && control.timerConfig && (
                          <span>{control.timerConfig.durationMinutes} min timer</span>
                        )}
                        {!control.hasPoints && !control.hasTimer && <span>Display only</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/project/${projectId}/control/${control.id}`}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <QrCode size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteControl(control.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
