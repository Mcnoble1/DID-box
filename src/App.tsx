import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Health from './pages/Health';
import Education from './pages/Education';
import Entertainment from './pages/Entertainment';
import Reviews from './pages/Reviews';
import Professional from './pages/Professional';
import Social from './pages/Social';
import Chat from './pages/Chat';
import Notes from './pages/Notes';
import Financial from './pages/Financial';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Customers from './pages/Customers';
import Transportation from './pages/Categories/Transportation';
import Others from './pages/Categories/Others';
import Homepage from './pages/Homepage';
import Configuration from './pages/Configuration';
import Loader from './common/Loader';
import routes from './routes';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));

function App() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
    <Toaster position='top-right' reverseOrder={false} containerClassName='overflow-auto'/>
  
      <Routes>
        <Route path="/" index element={<Homepage />} />
        <Route path="/homepage" index element={<Homepage />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/health" element={<Health />} />
        <Route path="/social" element={<Social />} />
        <Route path="/entertainment" element={<Entertainment />} />
        <Route path="/education" element={<Education />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/professional" element={<Professional />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/categories/transportation" element={<Transportation />} />
        <Route path="/categories/others" element={<Others />} />
        <Route element={<DefaultLayout />}>
          <Route element={<Dashboard />} />
          {routes.map(({ path, component: Component }) => (
            <Route
              path={path}
              element={
                <Suspense fallback={<Loader />}>
                  <Component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </>
  );
}

export default App;
