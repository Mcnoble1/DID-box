import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CardFour from '../components/CardFour.tsx';
import CardOne from '../components/CardOne.tsx';
import CardThree from '../components/CardThree.tsx';
import CardTwo from '../components/CardTwo.tsx';
import FeedbacksTable from '../components/FeedbacksTable.tsx';
const Dashboard = () => {
    const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  

  useEffect(() => {
    // Check if the user is signed in, otherwise redirect to the sign-in page
    const isSignedIn = localStorage.getItem('token');
    if (!isSignedIn) {
      navigate('/signin');
    } else {
      // Fetch categories when the component mounts
    }
  }, [navigate]);


  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
    {/* <!-- ===== Page Wrapper Start ===== --> */}
    <div className="flex h-screen overflow-hidden">
      {/* <!-- ===== Sidebar Start ===== --> */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* <!-- ===== Sidebar End ===== --> */}

      {/* <!-- ===== Content Area Start ===== --> */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* <!-- ===== Header Start ===== --> */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Header End ===== --> */}

        {/* <!-- ===== Main Content Start ===== --> */}
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
              <CardOne />
              <CardTwo />
              <CardFour />
            </div>

            <div className="mt-4">
            <div className="flex flex-col gap-10">
                <FeedbacksTable />
              </div>
            </div>
          </div>
        </main>
        {/* <!-- ===== Main Content End ===== --> */}
      </div>
      {/* <!-- ===== Content Area End ===== --> */}
    </div>
    {/* <!-- ===== Page Wrapper End ===== --> */}
  </div>
  );
};

export default Dashboard;
