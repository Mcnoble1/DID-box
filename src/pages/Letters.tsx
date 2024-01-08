import { useState, useEffect, useRef, useContext, ChangeEvent, FormEvent } from 'react';
import Image from '../images/user/message.png';
import { Web5Context } from "../utils/Web5Context";
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../pages/signin.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';


const Letters = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { web5, myDid, profileProtocolDefinition } = useContext( Web5Context);

  const [popupOpen, setPopupOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<{ title: string; content: string; timestamp: string; publishedDate: string; }>({
    title: '',
    publishedDate: '',
    content: '',
    timestamp: '',
    // image: null,
  });
  const [usersDetails, setUsersDetails] = useState<User[]>([]);
  const [recipientDid, setRecipientDid] = useState("");
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [showViewButton, setShowViewButton] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [showDetails, setShowDetails] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    const file = e.target.files?.[0];
  
      if (file) {
        setSelectedFileName(file.name);
      }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (web5 && myDid) {
    fetchLetterDetails();
    }
  }, [web5, myDid]);


  const handleAddLetter = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); 
  
    const requiredFields = ['title', 'content', 'publishedDate'];
    const emptyFields = requiredFields.filter((field) => !formData[field]);
  
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
      requiredFields.forEach((field) => {
        if (!formData[field]) {
          const inputElement = document.querySelector(`[name="${field}"]`);
          if (inputElement) {
            inputElement.parentElement?.classList.add('error-outline');
          }
        }
      });
      setLoading(false);
      return; 
    }
      
    const formdata = new FormData();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const timestamp = `${currentDate} ${currentTime}`;
    formdata.append("title", formData.title);
    formdata.append("content", formData.content);
    formdata.append("publishedDate", formData.publishedDate);
    try {
      let record;
      console.log(formData);
      record = await writeLetterToDwn({...formData, timestamp});
      console.log(record);
      if (record) {
        const { status } = await record.send(myDid);
        console.log("Send record status in handleAddLetter", status);
      } else {
        toast.error('Failed to create letteral record', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
          });
          setLoading(false);
        throw new Error('Failed to create letteral record');       
      }
  
      setFormData({
        title: '',
        publishedDate: '',
        content: '',
        timestamp: '',
      });
  
      setPopupOpen(false);
      toast.success('Successfully created letteral record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
  
      setLoading(false);
  
    } catch (err) {
        console.error('Error in handleAddLetter:', err);
        toast.error('Error in handleAddLetter. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000, // Adjust the duration as needed
        });
        setLoading(false);
      } 
  };
  
  

     const writeLetterToDwn = async (letterData) => {
      const dateToFormat = new Date(formData.publishedDate);

      // if (isNaN(dateToFormat.getTime())) {
      //   console.error('Invalid date');
      // } else {
        // Format the date and time in YYYY-MM-DDThh:mm:ss.ssssssZ format
        const formattedDate = dateToFormat.toISOString().replace(/\.\d{3}Z$/, '.000000Z');
        console.log(formattedDate);
      // }
      try {
        const letterProtocol = profileProtocolDefinition;
        const { record, status } = await web5.dwn.records.write({
          data: letterData,
          message: {
            protocol: letterProtocol.protocol,
            protocolPath: 'letterDetails',
            schema: letterProtocol.types.letterDetails.schema,
            recipient: myDid,
            published: true,
            datePublished: formattedDate,
          },
        });
        console.log(record);
  
        if (status === 200) {
          return { ...letterData, recordId: record.id}
        } 
        console.log('Successfully wrote letteral details to DWN:', record);
        toast.success('Letter Details written to DWN', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        return record;
      } catch (err) {
        console.error('Failed to write letter details to DWN:', err);
        toast.error('Failed to write letter details to DWN. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
     }; 

 
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
        } else {
          console.error('No letter details found');
          toast.error('Failed to fetch letter details', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000,
          });
        }
      } catch (err) {
        console.error('Error in fetchLetterDetails:', err);
        toast.error('Error in fetchLetterDetails. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000,
        });
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
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <div className="flex flex-row flex-wrap justify-evenly gap-5 md:gap-0">
              <div className="w-full flex justify-between rounded-lg border border-stroke bg-white py-7.5 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="">
                    <h4 className="text-2xl font-bold text-black dark:text-white">
                    Send a letter into the Future 🚀
                    </h4>
                    <button
                      ref={trigger}
                      onClick={() => setPopupOpen(!popupOpen)}
                      className="inline-flex mt-10 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10">
                      Write Letter
                    </button>
                    {popupOpen && (
                          <div
                            ref={popup}
                            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                          >
                            <div
                              className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                              style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                            >
                              <div className="flex flex-row justify-between">
                                <h2 className="text-xl font-semibold mb-4">Add Letter Details</h2>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => setPopupOpen(false)} 
                                    className="text-blue-500 hover:text-gray-700 focus:outline-none"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 fill-current bg-primary rounded-full p-1 hover:bg-opacity-90"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="white"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <form>
                              <div className= "rounded-sm px-6.5 bg-white dark:border-strokedark dark:bg-boxdark">

                              <div className="mb-4.5 flex flex-col gap-6">
                              <div className="w-full">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Title
                                  </label>
                                  <div className={`relative ${formData.title ? 'bg-light-blue' : ''}`}>
                                  <input
                                    type="title"
                                    name="title"
                                    value={formData.title}
                                    required
                                    onChange={handleInputChange}
                                    placeholder="Letter to the future"
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                  </div>
                                </div>

                                <div className="w-full">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Content
                                  </label>
                                  <div className={`relative ${formData.content ? 'bg-light-blue' : ''}`}>
                                  <textarea
                                    name="content"
                                    required
                                    rows={6}
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="A Letter into the Future"
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                  </div>
                                </div>


                              <div className="w-full">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Publshed Date
                                  </label>
                                  <div className={`relative ${formData.publishedDate ? 'bg-light-blue' : ''}`}>
                                  <input
                                    type="date" 
                                    name="publishedDate"
                                    required
                                    value={formData.publishedDate}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                  </div>
                                </div>                     
                              </div>            
                            </div>
                              </form>
                                <button
                                  type="button"
                                  onClick={handleAddLetter}
                                  disabled={loading}
                                  className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {loading ? (
                                    <div className="flex items-center">
                                      <div className="spinner"></div>
                                      <span className="pl-1">Sending...</span>
                                    </div>
                                  ) : (
                                    <>Send Letter</>
                                  )}
                                </button>
                            </div>
                          </div>
                        )}
                  </div>
                  <div>
                    <img src={Image} width={120} height={120} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
              <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex flex-row mb-5 items-center gap-4 justify-end">
                 
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
                        <h3 className="text-xl mt-1 mb-5 font-medium text-black text-center dark:text-white">🥳🎉🎊You just sent a letter into the future! Hold tight. It will arrive on {user.publishedDate}</h3>
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
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Letters;



