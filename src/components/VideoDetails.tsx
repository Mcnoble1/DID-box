import { useState, useRef, useContext } from 'react';
import { toast } from 'react-toastify'; 
import { Web5Context } from "../utils/Web5Context";
import 'react-toastify/dist/ReactToastify.css'; 
const VideoDetails = () => {
  
  const { web5, myDid } = useContext( Web5Context);

  const [usersDetails, setUsersDetails] = useState<User[]>([]);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false)
  const [formData, setFormData] = useState<{ video: File | null }>({
    video: null,
  });

  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [videoURLs, setVideoURLs] = useState<string[]>([]);

  
const fetchVideoDetails = async () => {
  setFetchDetailsLoading(true);
  try {
    const response = await web5.dwn.records.query({
      from: myDid,
      message: {
        filter: {
            protocol: 'https://did-box.com',
            protocolPath: 'videoDetails',
        },
      },
    });
    console.log('Video Details:', response);

    
  response.records.forEach( async (videoRec) => {
  console.log('this is the each video record', videoRec);
   // Get the blob of the video data
   const videoId = videoRec.id;
    console.log(videoId);
    const {record, status }= await web5.dwn.records.read({
      message: {
        filter: {
          recordId: videoId,
         },
      },
    });
    console.log({record, status});
    const videoResult = await record.data.blob();
    console.log(videoResult);
    const videoURL = URL.createObjectURL(videoResult);
    console.log(videoURL);
    setVideoURLs(prevVideoURLs => [...prevVideoURLs, videoURL]);
  });

  toast.success('Successfully fetched video details', {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
  });

    setFetchDetailsLoading(false);

  } catch (err) {
    console.error('Error in fetchVideoDetails:', err);
    toast.error('Error in fetchVideoDetails. Please try again later.', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
    });
    setFetchDetailsLoading(false);
  };
};


const showDeleteConfirmation = (videoId: string) => {
    setUserToDeleteId(videoId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setUserToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };



const deleteVideoDetails = async (recordId) => {
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
        console.log('Video Details deleted successfully');
        toast.success('Video Details deleted successfully', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUsersDetails(prevVideoDetails => prevVideoDetails.filter(message => message.recordId !== recordId));
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
    console.error('Error in deleteVideoDetails:', error);
  }
};


  return (
    <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex flex-row mb-5 items-center gap-4 justify-end">
     <button 
       onClick={fetchVideoDetails}
       className=" items-center  rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90">
       {fetchDetailsLoading ? (
         <div className="flex items-center">
           <div className="spinner"></div>
           <span className="pl-1">Fetching...</span>
         </div>
       ) : (
         <>Fetch Videos</>
       )}           
     </button>
   </div>
   {videoURLs.length > 0 ? (
     <div className="flex flex-col lg:flex-row justify-evenly">
     {videoURLs.map((video, index) => (
     <div className="flex w-full lg:w-2/5" key={index}>
      <div className='mb-5'>
        <video width="320" height="240" controls>
          <source src={video} type="video/mp4" />
        </video>
        <div className='w-full flex mt-5 flex-row justify-evenly mb-5'>
         <div className="relative">
           <button
             onClick={() => showDeleteConfirmation(video.recordId)}
             className="inline-flex items-center justify-center rounded-full bg-danger py-3 px-7 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
           >
             Delete
           </button>
           {isDeleteConfirmationVisible && (
             <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
               <div className="bg-white p-5 rounded-lg shadow-md">
                 <p>Are you sure you want to delete this video?</p>
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
                       deleteVideoDetails(video.recordId);
                     }}
                     className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                   >
                     Confirm
                   </button>
                 </div>
               </div>
             </div>
           )}
         </div>
       </div>
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

export default VideoDetails;
