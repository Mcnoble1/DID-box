import { lazy } from 'react';

const Transportation = lazy(() => import('../pages/Categories/Transportation'));
const Others = lazy(() => import('../pages/Categories/Others'));
const Workers = lazy(() => import('../pages/Workers'));
const Customers = lazy(() => import('../pages/Customers'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const Configuration = lazy(() => import('../pages/Configuration'));

const coreRoutes = [
  {
    path: '/forgot-password',
    title: 'Forgot Password',
    component: ForgotPassword,
  },
  {
    path: '/dashboard', 
    title: 'Dashboard',
    component: Dashboard, 
  },
  {
    path: '/customers',
    title: 'Customers',
    component: Customers,
  },
  {
    path: '/workers',
    title: 'Workers',
    component: Workers,
  },
  {
    path: '/categories/transportation',
    title: 'Transportation',
    component: Transportation,
  },
  {
    path: '/categories/others',
    title: 'All Categories',
    component: Others,
  },
  {
    path: '/configuration',
    title: 'Configuration',
    component: Configuration,
  },
];

const routes = [...coreRoutes];
export default routes;
