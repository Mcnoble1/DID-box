import { lazy } from 'react';

const Pictures = lazy(() => import('../pages/Files/Pictures'));
const Videos = lazy(() => import('../pages/Files/Videos'));
const Documents = lazy(() => import('../pages/Files/Documents'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Credentials = lazy(() => import('../pages/Credentials'));
const Chat = lazy(() => import('../pages/Chat'));
const Education = lazy(() => import('../pages/Education'));
const Letters = lazy(() => import('../pages/Letters'));
const Professional = lazy(() => import('../pages/Professional'));
const Health = lazy(() => import('../pages/Health'));
const Social = lazy(() => import('../pages/Social'));



const coreRoutes = [
  {
    path: '/dashboard', 
    title: 'Dashboard',
    component: Dashboard, 
  },
  {
    path: '/credentials', 
    title: 'Credentials',
    component: Credentials, 
  },
  {
    path: '/chat', 
    title: 'Chat',
    component: Chat, 
  },
  {
    path: '/letters', 
    title: 'Letters',
    component: Letters, 
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
    path: '/pictures',
    title: 'Pictures',
    component: Pictures,
  },
  {
    path: '/videos',
    title: 'Videos',
    component: Videos,
  },
  {
    path: '/documents',
    title: 'Documents',
    component: Documents,
  },
];

const routes = [...coreRoutes];
export default routes;
