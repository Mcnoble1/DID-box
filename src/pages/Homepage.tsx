import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../images/favicon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
const Homepage = () => {
  
  const navigate = useNavigate();


  return (
    <>
    <div className="rounded-sm bg-primary shadow-default dark:bg-boxdark">
      <div className='p-20 lg:p-0 flex w-full mb-0 flex-col lg:flex-row h-screen'>
        <div className="lg:pl-30 flex lg:w-1/2 flex-col items-center justify-center">
          <div className='text-center mb-7'>
          <p className="mb-5 text-5xl lg:text-6xl font-bold text-white dark:text-white">
            Welcome to DID-Box
          </p>
          <span className="text-3xl lg:text-4xl font-medium">Your Personal Secure Data Store, Manager and Aggregator</span>
          </div>
          <div className="flex justify-center">
          <button 
          onClick={() => navigate('/dashboard')}             
          className=" cursor-pointer rounded-lg text-2xl border border-primary bg-success p-4 text-white transition hover:bg-opacity-90"
            >
            Get Started
          </button>
          </div>  
        </div>
        <div className="flex lg:w-1/2 items-center justify-center">
          <img src={heroImage} alt="hero" />
        </div>
      </div>

      <div className='flex w-full lg:w-[90%] flex-col h-screen flex-wrap'>
        <div className="flex w-full justify-center mb-5 lg:mb-30 text-6xl font-bold text-white dark:text-white">
            Our Features
        </div>
        <div className="flex w-full lg:mx-[5%] flex-col lg:flex-row ">   
          <div className="flex flex-col lg:w-1/3">
            <FontAwesomeIcon icon={faFileAlt} size="6x" className="text-white mb-10 dark:text-white"/>
            <p className="text-center text-2xl  font-bold">
            Create and save your (Personal, Education, Health, Social, and Professional) records in your personal Decentralized Web Node (DWN).
            Share your records and files with other users.
            </p>            
          </div>
          <div className="flex flex-col lg:w-1/3">
            <FontAwesomeIcon icon={faVideo} size="6x" className="text-white mb-10 dark:text-white"/>
            <p className="text-center text-2xl  font-bold">
            Save your files (Documents, Images, Videos) in your personal Decentralized Web Node (DWN).
            Share your records and files with other users.
            </p>
          </div>
          <div className="flex flex-col lg:w-1/3">
            <FontAwesomeIcon icon={faPencilAlt} size="6x" className="text-white mb-10 dark:text-white"/>
            <p className="text-center text-2xl  font-bold">
            Write Letters into the Future to yourself and others.
            </p>  
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default Homepage;

