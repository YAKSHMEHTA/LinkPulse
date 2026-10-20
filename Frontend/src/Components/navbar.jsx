import'./navbar.css';
import {useNavigate, Link} from 'react-router-dom';

function Navbar(){

  const navigate = useNavigate();

  async function logout() {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    }catch(error){
      console.error("Logout failed:", error);
    }finally{
      navigate("/login", { replace: true });
    }
  }

  return(
    <nav className='navbar'>
      <h2 className='logo'>
        LinkPulse </h2>

			<div className='nav-links'>
				<a href="#dashboard">Dashboard</a>
				<a href="#my-links">My links</a>
				<a href="#analytics">Analytics</a>
				<Link to="/campaigns">Campaigns</Link>
        <button onClick={logout}>Logout</button>
			</div>

    </nav>
  );
}

export default Navbar;