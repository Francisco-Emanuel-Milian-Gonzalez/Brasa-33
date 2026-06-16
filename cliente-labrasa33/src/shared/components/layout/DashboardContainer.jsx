import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';

export const DashboardContainer = ({ user, onLogout, children }) => {
  return (
    <div className='min-h-screen bg-[var(--bg)] text-[var(--text)]'>
      <Navbar user={user} onLogout={onLogout} />
      <div className='flex min-h-[calc(100vh-4rem)]'>
        <Sidebar />
        <main className='flex-1 overflow-x-hidden overflow-y-auto p-6 xl:px-10'>
          {children}
        </main>
      </div>
    </div>
  );
};
