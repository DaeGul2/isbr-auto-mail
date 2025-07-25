const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>
      로그아웃
    </button>
  );
};

export default LogoutButton;
