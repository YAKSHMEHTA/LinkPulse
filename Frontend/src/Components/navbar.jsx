import'./navbar.css';
import {useNavigate} from 'react-router-dom';

function Navbar(){

  const navigate = useNavigate();

  function logout(){
    document.cookie = "token=; Max-Age=0; path=/; domain=linkpulse-1-e09g.onrender.com";
    document.cookie = "accessToken=; Max-Age=0; path=/; domain=linkpulse-1-e09g.onrender.com";

    navigate('/login');
  }

  return(
    <nav className='navbar'>
      <h2 className='logo'>
        LinkPulse </h2>

			<div className='nav-links'>
				<a href="#dashboard">Dashboard</a>
				<a href="#my-links">My links</a>
				<a href="#analytics">Analytics</a>
				<a href="#campaigns">Campaigns</a>
        <button onClick={logout}>Logout</button>
			</div>

    </nav>
  );
}

export default Navbar;