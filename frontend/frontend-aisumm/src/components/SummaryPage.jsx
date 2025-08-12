import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const SummaryPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <div style={{ 
        width: '220px', 
        backgroundColor: '#f4f4f4', 
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3>Navigation</h3>
          <NavLink
            to="/summary/users"
            style={({ isActive }) => ({
              display: 'block',
              marginBottom: '1rem',
              textDecoration: 'none',
              color: 'black',
              fontWeight: isActive ? 'bold' : 'normal',
            })}
          >
            Users
          </NavLink>
          <NavLink
            to="/summary/content"
            style={({ isActive }) => ({
              display: 'block',
              textDecoration: 'none',
              color: 'black',
              fontWeight: isActive ? 'bold' : 'normal',
            })}
          >
            Content
          </NavLink>
        </div>

        {/* Logout Button at Bottom */}
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginTop: 'auto',
            width: '100%'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Section */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SummaryPage;