import { lazy } from 'react';

const Transportation = lazy(() => import('../pages/Categories/Transportation'));
const Others = lazy(() => import('../pages/Categories/Others'));
const Workers = lazy(() => import('../pages/Workers'));
const Customers = lazy(() => import('../pages/Customers'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Configuration = lazy(() => import('../pages/Configuration'));
const Education = lazy(() => import('../pages/Education'));
const Entertainment = lazy(() => import('../pages/Entertainment'));
const Chat = lazy(() => import('../pages/Chat'));
const Notes = lazy(() => import('../pages/Notes'));
const Financial = lazy(() => import('../pages/Financial'));
const Professional = lazy(() => import('../pages/Professional'));
const Health = lazy(() => import('../pages/Health'));
const Social = lazy(() => import('../pages/Social'));
const Reviews = lazy(() => import('../pages/Reviews'));



const coreRoutes = [
  {
    path: '/dashboard', 
    title: 'Dashboard',
    component: Dashboard, 
  },
  {
    path: '/notes', 
    title: 'Notes',
    component: Notes, 
  }, 
  {
    path: '/chat', 
    title: 'Chat',
    component: Chat, 
  },
  {
    path: '/education', 
    title: 'Education',
    component: Education, 
  },
  {
    path: '/professional', 
    title: 'Professional',
    component: Professional, 
  },
  {
    path: '/reviews', 
    title: 'Reviews',
    component: Reviews, 
  },
  {
    path: '/health', 
    title: 'Health',
    component: Health, 
  },
  {
    path: '/social', 
    title: 'Social',
    component: Social, 
  },
  {
    path: '/entertainment',
    title: 'Entertainment',
    component: Entertainment,
  },
  {
    path: '/financial',
    title: 'Financial',
    component: Financial,
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
