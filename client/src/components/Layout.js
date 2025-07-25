import { Outlet } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Layout = () => {
  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', background: '#f4f4f4' }}>
        <LogoutButton />
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
