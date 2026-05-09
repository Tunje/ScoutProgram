import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProjectSelect from './pages/ProjectSelect';
import ScanPage from './pages/ScanPage';
import GroupRegistration from './pages/GroupRegistration';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/projects" element={<ProjectSelect />} />
        <Route path="/scan/:projectId" element={<ScanPage />} />
        <Route path="/register/:projectId" element={<GroupRegistration />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
