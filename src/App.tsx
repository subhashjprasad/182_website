import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DirectoryPage } from './pages/DirectoryPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { InsightsPage } from './pages/InsightsPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DirectoryPage />} />
        <Route path="directory" element={<DirectoryPage />} />
        <Route path="post/:postId" element={<PostDetailPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
