import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Group, Scan } from '@/types';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

interface ControlDetail {
  controlId: string;
  controlName: string;
  points: number;
  timerSeconds: number;
  completedAt: string;
  categoryPoints?: { [key: string]: string };
}

interface GroupScore {
  group: Group;
  totalPoints: number;
  scanCount: number;
  lastScanTime?: Date;
  controls: ControlDetail[];
}

export default function Leaderboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [groupScores, setGroupScores] = useState<GroupScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        setProject({ id: projectDoc.id, ...projectDoc.data() } as Project);
      }
    };

    fetchProject();

    // Listen to groups
    const groupsQuery = query(
      collection(db, 'groups'),
      where('projectId', '==', projectId),
      where('isClaimed', '==', true)
    );

    const unsubGroups = onSnapshot(groupsQuery, async (groupsSnapshot) => {
      const groups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];

      // Listen to scans
      const scansQuery = query(
        collection(db, 'scans'),
        where('projectId', '==', projectId)
      );

      const unsubScans = onSnapshot(scansQuery, async (scansSnapshot) => {
        const scans = scansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Scan[];

        // Calculate scores for each group
        const scores: GroupScore[] = await Promise.all(
          groups.map(async (group) => {
            const groupScans = scans.filter(scan => scan.groupId === group.id);
            
            let totalPoints = 0;
            let lastScanTime: Date | undefined;
            const controlDetails: ControlDetail[] = [];

            if (groupScans.length === 0) {
              return {
                group,
                totalPoints: 0,
                scanCount: 0,
                lastScanTime: undefined,
                controls: []
              };
            }

            for (const scan of groupScans) {
              // Add points from controls object
              if (scan.controls) {
                for (const [controlId, controlData] of Object.entries(scan.controls)) {
                  if (controlData.points) {
                    totalPoints += controlData.points;
                  }

                  // Fetch control name
                  const controlDoc = await getDoc(doc(db, 'controls', controlId));
                  const controlName = controlDoc.exists() ? controlDoc.data().name : 'Unknown';

                  controlDetails.push({
                    controlId,
                    controlName,
                    points: controlData.points,
                    timerSeconds: controlData.timerSeconds,
                    completedAt: controlData.completedAt,
                    categoryPoints: controlData.categoryPoints
                  });

                  // Track last scan time
                  if (controlData.completedAt) {
                    const scanTime = new Date(controlData.completedAt);
                    if (!lastScanTime || scanTime > lastScanTime) {
                      lastScanTime = scanTime;
                    }
                  }
                }
              }
            }

            // Sort controls by completion time
            controlDetails.sort((a, b) => 
              new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            );

            return {
              group,
              totalPoints,
              scanCount: controlDetails.length,
              lastScanTime,
              controls: controlDetails
            };
          })
        );

        // Sort by points (descending), then by last scan time (ascending - earlier is better)
        scores.sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
          }
          if (a.lastScanTime && b.lastScanTime) {
            return a.lastScanTime.getTime() - b.lastScanTime.getTime();
          }
          return 0;
        });

        setGroupScores(scores);
        setLoading(false);
      });

      return () => unsubScans();
    });

    return () => unsubGroups();
  }, [projectId]);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy size={32} className="text-yellow-500" />;
      case 1:
        return <Medal size={32} className="text-gray-400" />;
      case 2:
        return <Award size={32} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300';
      case 1:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300';
      case 2:
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={40} className="text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <p className="text-gray-600">{project.name}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Calculating scores...</p>
          </div>
        ) : groupScores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Scores Yet</h3>
            <p className="text-gray-500">Groups will appear here once they start scanning controls</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupScores.map((score, index) => (
              <div
                key={score.group.id}
                className={`rounded-lg shadow-md p-6 border-2 transition-all ${getMedalColor(index)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12">
                      {getMedalIcon(index) || (
                        <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                      )}
                    </div>
                    
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: score.group.color }}
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{score.group.name}</h3>
                      <p className="text-sm text-gray-600">Kår: {score.group.kår}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600">
                      {score.totalPoints}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{score.scanCount} controls completed</span>
                    {score.lastScanTime && (
                      <span>Last: {score.lastScanTime.toLocaleTimeString()}</span>
                    )}
                  </div>

                  {score.controls && score.controls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Control Details:</h4>
                      {score.controls.map((control, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-900">{control.controlName}</span>
                            <span className="font-bold text-blue-600">{control.points} pts</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Timer: {Math.floor(control.timerSeconds / 60)}m {control.timerSeconds % 60}s</span>
                            <span>{new Date(control.completedAt).toLocaleString()}</span>
                          </div>
                          {control.categoryPoints && Object.keys(control.categoryPoints).length > 0 && (
                            <div className="mt-1 text-xs text-gray-600">
                              Categories: {Object.entries(control.categoryPoints).map(([name, pts]) => `${name}: ${pts}`).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {groupScores.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {groupScores.length}
                </div>
                <div className="text-sm text-gray-600">Groups</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {groupScores.reduce((sum, s) => sum + s.scanCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Scans</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {groupScores.reduce((sum, s) => sum + s.totalPoints, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
