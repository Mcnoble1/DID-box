import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; 

const CardTwo = () => {
  const [workersData, setWorkersData] = useState<Worker[]>([]);

  const url = "https://madad.onrender.com/api/admin/worker/get";
  const token = localStorage.getItem('token') || ''; 
  
  const config = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token}`, 
    },
  };

  useEffect(() => {
    axios.get<Worker[]>(url, config)
      .then((response) => {
        setWorkersData(response.data.workers);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="flex justify-between rounded-lg border border-stroke bg-white py-3 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex justify-between">
     <div>
     <span className="text-sm font-medium">Registered Workers</span>
       <h4 className="text-title-sm text-black dark:text-white">
          {workersData.length}
       </h4>
     </div>
   </div>
   
   <div className="flex h-11.5 w-11.5 items-center justify-center rounded bg-primary dark:bg-meta-4">
      <FontAwesomeIcon icon={faUserGroup} style={{color: "#ffffff",}} />
   </div>
 </div>
  );
};

export default CardTwo;
