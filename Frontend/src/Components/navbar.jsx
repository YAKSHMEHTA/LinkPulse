import './navbar.css';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/getuser`, {
          credentials: 'include',
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          setUserRole(null);
          return;
        }

        const userData = await res.json();
        setIsAuthenticated(true);
        setUserRole(userData?.role || null);
      } catch {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  async function logout() {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/login', { replace: true });
    }
  }

  return (
    <nav className='navbar'>
      <h2 className='logo'>LinkPulse</h2>

      <div className='nav-links'>
        {!loading && !isAuthenticated ? (
          <>
            <Link to='/login'>Sign in</Link>
            <Link to='/register'>Register</Link>
          </>
        ) : (
          <>
            <Link to='/dashboard'>Dashboard</Link>
            <Link to='/dashboard'>My links</Link>
            <Link to='/dashboard'>Analytics</Link>
            <Link to='/campaigns'>Campaigns</Link>
            {userRole === 'admin' && <Link to='/admin'>Admin</Link>}
            <button type='button' onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;