import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import ContextProvider from "./utils/Web5Context.tsx";
import './index.css';
import './satoshi.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <ContextProvider>
    <Router>
    <ToastContainer />
      <App />
    </Router>
  </ContextProvider>
  // </React.StrictMode>
);
