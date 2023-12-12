import { useState } from 'react';
import Sidebar from '../components/Sidebar.tsx';
import Header from '../components/Header.tsx';
import NotesCard from '../components/ProfileCard.tsx';
import DidCard from '../components/DidCard.tsx';
import NotesDetails from '../components/PersonalDetails.tsx';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <div className="flex flex-row flex-wrap justify-evenly gap-5 md:gap-0">
                <NotesCard />
                <DidCard />
              </div>

              <div className="mt-4">
                <NotesDetails />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



