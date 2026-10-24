import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-bg-secondary text-text-secondary py-6 mt-8">
      <div className="container flex flex-col items-center">
        <p className="text-sm">© {new Date().getFullYear()} CineBook. All rights reserved.</p>
        <div className="flex space-x-4 mt-2">
          <Link to="/" className="hover:text-violet-light">Home</Link>
          <Link to="/movies" className="hover:text-violet-light">Movies</Link>
          <Link to="/privacy" className="hover:text-violet-light">Privacy</Link>
          <Link to="/terms" className="hover:text-violet-light">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
