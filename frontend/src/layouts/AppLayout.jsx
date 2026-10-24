import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
