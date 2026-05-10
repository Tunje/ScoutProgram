import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot, addDoc, Timestamp, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateProjectCode = () => {
    // Generate a readable project code from project name
    const words = newProjectName.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/);
    const code = words.slice(0, 2).join('') + Math.floor(Math.random() * 1000);
    return code;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        projectCode: generateProjectCode(),
        createdAt: Timestamp.now(),
        status: 'active'
      });
      setNewProjectName('');
      setShowNewProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scout Points Admin</h1>
          <p className="text-gray-600">Manage projects, groups, and controls</p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Active Projects</h2>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {showNewProject && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleCreateProject}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProject(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FolderOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowNewProject(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-2 border-transparent hover:border-blue-500 relative"
              >
                <Link to={`/project/${project.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <FolderOpen size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mb-2">
                    Code: {project.projectCode}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created {project.createdAt.toDate().toLocaleDateString()}
                  </p>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteProject(project.id);
                  }}
                  className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete project"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
