import { Outlet } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import LayoutBar from './LayoutBar';

const Layout = () => {
  return (
    <div>
      <LayoutBar />
      <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 1rem', background: '#f4f4f4' }}>
        <LogoutButton />
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
