import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SentEmailsPage from './pages/SentEmailsPage';
import EmailResponsePage from './pages/EmailResponsePage';
import ComposeEmailPage from './pages/ComposeEmailPage';
import EmailDetailModal from './components/EmailDetailModal';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout'; // ✅ 공통 레이아웃 추가

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인과 응답은 인증 없이 접근 가능 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/respond/:token" element={<EmailResponsePage />} />

        {/* 보호된 페이지 (공통 레이아웃 적용) */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<SentEmailsPage />} />
            <Route path="/emails/:id" element={<EmailDetailModal />} />
            <Route path="/compose" element={<ComposeEmailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
