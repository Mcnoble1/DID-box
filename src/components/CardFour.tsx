import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; 

const CardFour = () => {
  const [usersData, setUsersData] = useState<User[]>(0);

  const url = "https://madad.onrender.com/api/admin/daily-users";
  const token = localStorage.getItem('token') || ''; // Replace '' with your default token if needed
  
  const config = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
    },
  };

  useEffect(() => {
    // Replace 'API_ENDPOINT' with your actual backend API endpoint.
    axios.get<User[]>(url, config)
      .then((response) => {
        setUsersData(response.data.dailyUserCount);
        console.log(response.data.dailyUserCount);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="flex justify-between rounded-lg border border-stroke bg-white py-3 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex justify-between">
     <div>
     <span className="text-sm font-medium">Daily Active Users</span>
       <h4 className="text-title-sm text-black dark:text-white">
         {usersData}
       </h4>
     </div>
   </div>
   
   <div className="flex h-11.5 w-11.5 items-center justify-center rounded bg-primary dark:bg-meta-4">
   <FontAwesomeIcon icon={faCircleUser} style={{color: "#ffffff",}} />   
   </div>
 </div>
  );
};

export default CardFour;
