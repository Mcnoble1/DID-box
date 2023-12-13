import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
const LetterDetails = () => {
  
  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);

  const [usersDetails, setUsersDetails] = useState<User[]>([]);
  const [recipientDid, setRecipientDid] = useState("");
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false)
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ timestamp: string; title: string; content: string; publishedDate: string; }>({
    title: '',
    publishedDate: '',
    content: '',
    timestamp: '',
    // image: null,
  });
  
  
  const [showDetails, setShowDetails] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    const initWeb5 = async () => {
      // @ts-ignore
      const { Web5 } = await import('@web5/api/browser');
      
      try {
        const { web5, did } = await Web5.connect({ 
          sync: '5s', 
        });
        setWeb5(web5);
        setMyDid(did);
        console.log(web5);
      } catch (error) {
        console.error('Error initializing Web5:', error);
      }
    };

    initWeb5();
    
}, []);

// useEffect(() => {

//   usersDetails.map((user) => {
//     const targetDate: any = user.publishedDate;

//     const currentDate = new Date();
//     const formattedTargetDate = new Date(targetDate);

//     if (currentDate >= formattedTargetDate) {
//       setShowViewButton(true);
//     } else {
//       setShowViewButton(false);
//     }
//   });
// }, []);
  
const toggleDetails = () => {
  setShowDetails((prevShowDetails) => !prevShowDetails);
};

const togglePopup = (userId: string) => {
  usersDetails.map((user) => { 
    if (user.recordId === userId) {
      setFormData({
        title: user.title,
        content: user.content,
        publishedDate: user.publishedDate,
        timestamp: user.timestamp,
        // image: null,
      });
    }
  });
  setPopupOpenMap((prevMap) => ({
    ...prevMap,
    [userId]: !prevMap[userId],
  }));
};
  
const closePopup = (userId: string) => {
  setPopupOpenMap((prevMap) => ({
    ...prevMap,
    [userId]: false,
  }));
};

const fetchLetterDetails = async () => {
  setFetchDetailsLoading(true);
  try {
    const response = await web5.dwn.records.query({
      from: myDid,
      message: {
        filter: {
            protocol: 'https://did-box.com',
            protocolPath: 'letterDetails',
        },
      },
    });
    console.log('Letter Details:', response);

    if (response.status.code === 200) {
      const letterDetails = await Promise.all(
        response.records.map(async (record) => {
          const data = await record.data.json();
          console.log(data);
          return {
            ...data,
            recordId: record.id,
          };
        })
      );
      setUsersDetails(letterDetails);
      console.log(letterDetails);

      usersDetails.map((user) => {
        const targetDate: any = user.publishedDate;
    
        const currentDate = new Date();
        const formattedTargetDate = new Date(targetDate);
    
        if (currentDate >= formattedTargetDate) {
          setShowViewButton(true);
        } else {
          setShowViewButton(false);
        }
      });
      
      toast.success('Successfully fetched letter details', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
      setFetchDetailsLoading(false);
    } else {
      console.error('No letter details found');
      toast.error('Failed to fetch letter details', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    }
    setFetchDetailsLoading(false);
  } catch (err) {
    console.error('Error in fetchLetterDetails:', err);
    toast.error('Error in fetchLetterDetails. Please try again later.', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
    });
    setFetchDetailsLoading(false);
  };
};


const shareLetterDetails = async (recordId: string) => {
  setShareLoading(true);
  try {
    const response = await web5.dwn.records.query({
      message: {
        filter: {
          recordId: recordId,
        },
      },
    });

    if (response.records && response.records.length > 0) {
      const record = response.records[0];
      const { status } = await record.send(recipientDid);
      console.log('Send record status in shareLetter', status);
      toast.success('Successfully shared letter record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
      setShareLoading(false);
      setSharePopupOpen(false);
    } else {
      console.error('No record found with the specified ID');
      toast.error('Failed to share letter record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    }
    setShareLoading(false);
  } catch (err) {
    console.error('Error in shareProfile:', err);
    toast.error('Error in shareProfile. Please try again later.', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
    });
    setShareLoading(false);
  }
};

const showDeleteConfirmation = (userId: string) => {
    setUserToDeleteId(userId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setUserToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };


const deleteLetterDetails = async (recordId) => {
  try {
    const response = await web5.dwn.records.query({
      message: {
        filter: {
          recordId: recordId,
        },
      },
    });
    console.log(response);
    if (response.records && response.records.length > 0) {
      const record = response.records[0];
      console.log(record)
      const deleteResult = await web5.dwn.records.delete({
        message: {
          recordId: recordId
        },
      });

      const remoteResponse = await web5.dwn.records.delete({
        from: myDid,
        message: {
          recordId: recordId,
        },
      });
      console.log(remoteResponse);
      
      if (deleteResult.status.code === 202) {
        console.log('Letter Details deleted successfully');
        toast.success('Letter Details deleted successfully', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUsersDetails(prevLetterDetails => prevLetterDetails.filter(message => message.recordId !== recordId));
      } else {
        console.error('Error deleting record:', deleteResult.status);
        toast.error('Error deleting record:', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
      }
    } else {
      // console.error('No record found with the specified ID');
    }
  } catch (error) {
    console.error('Error in deleteLetterDetails:', error);
  }
};


  return (
    <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex flex-row mb-5 items-center gap-4 justify-end">
     <button 
       onClick={fetchLetterDetails}
       className=" items-center  rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90">
       {fetchDetailsLoading ? (
         <div className="flex items-center">
           <div className="spinner"></div>
           <span className="pl-1">Fetching...</span>
         </div>
       ) : (
         <>Fetch Letters</>
       )}           
     </button>
     <div className="relative">
       <button
         onClick={toggleDetails}
         className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
       >
         {showDetails ? 'Hide Details' : 'Show Details'}
       </button>
     </div>
   </div>
   {usersDetails.length > 0 ? (
     <div className="flex flex-row mb-5 flex-wrap gap-5">
     {usersDetails.map((user, index) => (
     <div className="flex flex-col flex-wrap rounded-xl p-5 w-1/3  shadow" key={index}>
        {showViewButton ? (
          <>
        <h3 className="text-xl mt-1 mb-5 font-medium text-black text-center dark:text-white">🥳🎉🎊Here is your Letter from {user.timestamp}</h3>
          <div className='mb-5'>
          <h4 className="text-xl mt-1 font-medium text-center text-black dark:text-white">
            {showDetails ? user.title : '********'}
          </h4>
        </div>
        </>
        ) : (
          <h3 className="text-xl mt-1 mb-5 font-medium text-black text-center dark:text-white">🥳🎉🎊You just sent a letter into the future! Hold tight</h3>
        )}      
        

       <div className='w-full flex flex-row justify-evenly mb-5'>

      {showViewButton && (
      <div className="relative">
      <button
        onClick={() => togglePopup(user.recordId)}                      
        className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
        View
      </button>
        {popupOpenMap[user.recordId] && (
              <div
                ref={popup}
                className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
              >
                <div
                    className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                    style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                  >              
                      <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold mb-4"></h2>
                      <div className="flex justify-end">
                        <button
                          onClick={() => closePopup(user.recordId)}
                          className="text-blue-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 fill-current bg-primary rounded-full p-1 hover:bg-opacity-90"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <form>
                    <div className= "rounded-sm px-6.5 bg-white dark:border-strokedark dark:bg-boxdark">

                     <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                     <div className="w-full xl:w-2/2">
                     <h2 className="text-xl font-semibold mb-4">{user.title}</h2>
                      <div>{user.content}</div>
                       </div>
                     </div>
                     </div>
                   </form>
                  </div>
              </div>
            )}
    </div> 
      )}

      {showViewButton && (
         <div className="relative">
           <button
             onClick={() => showDeleteConfirmation(user.recordId)}
             className="inline-flex items-center justify-center rounded-full bg-danger py-3 px-7 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
           >
             Delete
           </button>
           {isDeleteConfirmationVisible && (
             <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
               <div className="bg-white p-5 rounded-lg shadow-md">
                 <p>Are you sure you want to delete your letter?</p>
                 <div className="mt-4 flex justify-end">
                   <button
                     onClick={hideDeleteConfirmation}
                     className="mr-4 rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={() => {
                       hideDeleteConfirmation();
                       deleteLetterDetails(user.recordId);
                     }}
                     className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                   >
                     Confirm
                   </button>
                 </div>
               </div>
             </div>
           )}
         </div>)}
       </div>
     </div>
     ))}
     </div>
     ) : (
       <div className="flex items-center justify-center h-48">
         <div className="text-md font-medium text-gray-500 dark:text-gray-400">
           No Details yet
         </div>
       </div>
     )}
   </div>
  );
};

export default LetterDetails;
