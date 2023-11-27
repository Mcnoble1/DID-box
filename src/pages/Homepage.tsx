import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Homepage = () => {
  
  const navigate = useNavigate();

  // useEffect(() => {
  //   // When the component mounts, check localStorage for email and rememberMe values
  //   const savedEmail = localStorage.getItem('email');
   
  //   if (savedEmail ) {
      
  //   }
  // }, []);


  return (
    <>
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="w-full flex flex-col h-screen items-center justify-center bg-primary border-stroke dark:border-strokedark xl:border-l-2">
        
        <h2 className="mb-5 text-5xl font-bold text-white dark:text-white sm:text-title-xl2">
          Welcome to DID-Box
        </h2>
        <span className="mb-9 text-3xl font-medium">Your Personal Secure Data Storage Solution, Management and Aggregator</span>
        <button 
        onClick={() => navigate('/dashboard')}             
        className=" cursor-pointer rounded-lg text-2xl border border-primary bg-success p-4 text-white transition hover:bg-opacity-90"
          >
          Get Started
      </button>
          
        </div>
    </div>
  </>
  );
};

export default Homepage;

