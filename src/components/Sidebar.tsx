import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../images/logo/logo.png';
import SidebarLinkGroup from './SidebarLinkGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faImages } from '@fortawesome/free-solid-svg-icons';
import { faHospital } from '@fortawesome/free-solid-svg-icons';
import { faPerson } from '@fortawesome/free-solid-svg-icons';
import { faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';


interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen flex-col overflow-y-hidden bg-primary duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/dashboard" className="flex flex-row justify-between">
          <img src={Logo} alt="Logo" height={50} width={50} className='mr-5' />

         <div className='text-white text-2xl font-bold flex items-center mr-3'>
            DID-Box
          </div> 
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <ul className="mb-6 flex flex-col gap-1.5">

         
             <li>
                <NavLink
                  to="/dashboard"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                    pathname.includes('dashboard') && 'border-r-4 dark:bg-meta-4'
                  }`}
                >
                   <FontAwesomeIcon icon={faCircleUser} style={{color: "#ffffff",}} />
                  Personal
                </NavLink>
              </li>

              <SidebarLinkGroup
                activeCondition={
                  pathname === '/categories' || pathname.includes('categories')
                }
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out dark:hover:bg-meta-4 ${
                          (pathname === '/categories' ||
                            pathname.includes('categories')) &&
                          ' dark:bg-meta-4'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded
                            ? handleClick()
                            : setSidebarExpanded(true);
                        }}
                      >
                       <FontAwesomeIcon icon={faFile} />
                        File Manager
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </NavLink>
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && 'hidden'
                        }`}
                      >
                        <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                          <li>
                            <NavLink
                              to="/files/pictures"
                              className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                                (pathname === '/files' ||
                                  pathname.includes('pictures')) &&
                                'border-r-4 dark:bg-meta-4'
                              }`}
                            >
                          <FontAwesomeIcon icon={faImages} style={{color: "#ffffff",}} />
                              Pictures
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/files/videos"
                              className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                                (pathname === '/files' ||
                                  pathname.includes('videos')) &&
                                'border-r-4 dark:bg-meta-4'
                              }`}
                            >
                             <FontAwesomeIcon icon={faVideo} style={{color: "#ffffff",}} />
                              Videos
                            </NavLink>
                          </li>
                          <li>
                            <NavLink
                              to="/files/documents"
                              className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                                (pathname === '/files' ||
                                  pathname.includes('documents')) &&
                                'border-r-4 dark:bg-meta-4'
                              }`}
                            >
                              <FontAwesomeIcon icon={faFileAlt} style={{color: "#ffffff",}} />
                              Documents
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
             
              <li>
                <NavLink
                  to="/education"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                    pathname.includes('education') && 'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faBook} style={{color: "#ffffff",}} />
                 Education
                </NavLink>
              </li>
             
              <li>
                <NavLink
                  to="/health"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 border-fuchsia-600 dark:hover:bg-meta-4 ${
                    pathname.includes('health') &&
                    'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faHospital} style={{color: "#fcfcfc",}} />
                  Health
                </NavLink>
              </li>

              {/* <li>
                <NavLink
                  to="/entertainment"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 border-fuchsia-600 dark:hover:bg-meta-4 ${
                    pathname.includes('entertainment') &&
                    'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faUserGroup} style={{color: "#fcfcfc",}} />
                 Entertainment
                </NavLink>
              </li> */}

              <li>
                <NavLink
                  to="/chat"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 border-fuchsia-600 dark:hover:bg-meta-4 ${
                    pathname.includes('chat') &&
                    'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faBook} style={{color: "#fcfcfc",}} />
                  Chat
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/professional"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 border-fuchsia-600 dark:hover:bg-meta-4 ${
                    pathname.includes('professional') &&
                    'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faPerson} style={{color: "#fcfcfc",}} />
                  Professional
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/social"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 border-fuchsia-600 dark:hover:bg-meta-4 ${
                    pathname.includes('social') &&
                    'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faTwitter} style={{color: "#fcfcfc",}} />
                 Social Media
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/letters"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                    pathname.includes('letters') && 'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faNoteSticky} style={{color: "#ffffff",}} />
                 Letters
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/credentials"
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:border-r-4 dark:hover:bg-meta-4 ${
                    pathname.includes('credentials') && 'border-r-4 dark:bg-meta-4'
                  }`}
                >
                  <FontAwesomeIcon icon={faNoteSticky} style={{color: "#ffffff",}} />
                 Credentials
                </NavLink>
              </li>
            </ul>
          </div>

        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
