import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Customers from './pages/Customers';
import Transportation from './pages/Categories/Transportation';
import Others from './pages/Categories/Others';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
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
        <Route path="/" index element={<SignIn />} />
        <Route path="/signin" index element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signin/forgot-password" element={<ForgotPassword />} />
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
