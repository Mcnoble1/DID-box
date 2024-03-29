import { useState, useEffect, useRef, useContext, ChangeEvent, FormEvent } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Web5Context } from "../utils/Web5Context";
import Behance from '../images/social/Behance-1.png';
import Discord from '../images/social/Discord-1.png';
import Instagram from '../images/social/Instagram-1.png';
import Twitter from '../images/social/Twitter-1.png'
import Facebook from '../images/social/Facebook-1.png'
import GitHub from '../images/social/GitHub-1.png'
import X from '../images/social/X-1.png'
import Whatsapp from '../images/social/Whatsapp-1.png'
import Slack from '../images/social/Slack-1.png'
import Twitch from '../images/social/Twitch-1.png'
import LinkedIn from '../images/social/LinkedIn-1.png'
import Snapchat from '../images/social/Snapchat-1.png'
import Telegram from '../images/social/Telegram-1.png'
import Tiktok from '../images/social/Tiktok-1.png'
import Youtube from '../images/social/Youtube-1.png'
import Skype from '../images/social/Skype-1.png'
import Line from '../images/social/Line-1.png'
import '../pages/signin.css';
import Image from '../images/social/Twitter-1.png';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const Social = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { web5, myDid, profileProtocolDefinition } = useContext( Web5Context);

  const [showDetails, setShowDetails] = useState(false);
  const [socialData, setSocialData] = useState<Social[]>([]);
  const [userToDeleteId, setWorkerToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [recipientDid, setRecipientDid] = useState("");
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ username: string; platform: string; url: string;}>({
    username: '',
    platform: '',
    url: '',
  });
  const [popupOpen, setPopupOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (web5 && myDid) {
    fetchSocialDetails();
    }
  }, [web5, myDid]);

  const togglePopup = (userId: string) => {
    socialData.map((user) => { 
      if (user.recordId === userId) {
        setFormData({
         username: user.username,
         platform: user.platform,
          url: user.url,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [userId]: !prevMap[userId],
    }));
  };
  
// Function to close the popup for a specific user
const closePopup = (userId: number) => {
  setPopupOpenMap((prevMap) => ({
    ...prevMap,
    [userId]: false,
  }));
};

const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
};

   
const handleAddProfile = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true); 

  const requiredFields = ['username', 'url', 'platform'];
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
  formdata.append('username', formData.username);
  formdata.append('url', formData.url);
  formdata.append('platform', formData.platform);  


  try {
    let record;
    record = await writeProfileToDwn(formData);

    if (record) {
      const { status } = await record.send(myDid);
    } else {
      toast.error('Failed to create personal record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
        });
        setLoading(false);
      throw new Error('Failed to create personal record');       
    }
    fetchSocialDetails();

    setFormData({
      username: '',
      url: '',
      platform: '',
    });

    setPopupOpen(false);
    toast.success('Successfully created personal record', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000, 
    });

    setLoading(false);
  } catch (err) {
      console.error('Error in handleCreateCause:', err);
      toast.error('Error in handleAddProfile. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000, // Adjust the duration as needed
      });
      setLoading(false);
    } 
};

   const writeProfileToDwn = async (socialData) => {
    try {
      const personalProtocol = profileProtocolDefinition;
      const { record, status } = await web5.dwn.records.write({
        data: socialData,
        message: {
          protocol: personalProtocol.protocol,
          protocolPath: 'socialDetails',
          schema: personalProtocol.types.socialDetails.schema,
          recipient: myDid,
        },
      });

      if (status === 200) {
        return { ...socialData, recordId: record.id}
      } 
      toast.success('Social Details written to DWN', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
      return record;
    } catch (err) {
      console.error('Failed to write personal details to DWN:', err);
      toast.error('Failed to write personal details to DWN. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    }
   }; 

const toggleDetails = () => {
  setShowDetails((prevShowDetails) => !prevShowDetails);
};

const showDeleteConfirmation = (userId: string) => {
    setWorkerToDeleteId(userId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setWorkerToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };

  const fetchSocialDetails = async () => {
    
    try {
      const response = await web5.dwn.records.query({
        from: myDid,
        message: {
          filter: {
              protocol: 'https://did-box.com',
              protocolPath: 'socialDetails',
              // schema: 'https://did-box.com/schemas/socialDetails',
          },
        },
      });
  
      if (response.status.code === 200) {
        const socialDetails = await Promise.all(
          response.records.map(async (record) => {
            const data = await record.data.json();
            return {
              ...data,
              recordId: record.id,
            };
          })
        );
        setSocialData(socialDetails);
        toast.success('Successfully fetched social details', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      } else {
        console.error('No social details found');
        toast.error('Failed to fetch social details', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error('Error in fetchSocialDetails:', err);
      toast.error('Error in fetchSocialDetails. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    };
  };

  const shareSocialDetails = async (recordId: string) => {
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
        toast.success('Successfully shared social record', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        setShareLoading(false);
        setSharePopupOpen(false);
      } else {
        console.error('No record found with the specified ID');
        toast.error('Failed to share social record', {
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

  
  const updateSocialDetails = async (recordId, data) => {
    setUpdateLoading(true);
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
      const updateResult = await record.update( {data: data});
      togglePopup(recordId)
      if (updateResult.status.code === 202) {
        toast.success('Social Details updated successfully.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setSocialData(prevSocialDetails => prevSocialDetails.map(message => message.recordId === recordId ? { ...message, ...data } : message));
        setUpdateLoading(false);
      } else {
        console.error('Error updating message:', updateResult.status);
        toast.error('Error updating campaign', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUpdateLoading(false);
      }
    } else {
      console.error('No record found with the specified ID');
      toast.error('No record found with the specified ID', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
    }
  } catch (error) {
    console.error('Error in updateSocialDetail:', error);
    toast.error('Error in updateSocialDetail:', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000, 
    });
    setUpdateLoading(false);
  }
};


    const deleteSocialDetails = async (recordId) => {
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
          
          if (deleteResult.status.code === 202) {
            toast.success('Social Details deleted successfully', {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 3000, 
            });
            setSocialData(prevSocialDetails => prevSocialDetails.filter(message => message.recordId !== recordId));
          } else {
            console.error('Error deleting message:', deleteResult.status);
            toast.error('Error deleting donation:', {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 3000, 
            });
          }
        } else {
          // console.error('No record found with the specified ID');
        }
      } catch (error) {
        console.error('Error in deleteSocialDetails:', error);
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
                      Social Details
                    </h4>
                    <button
                      ref={trigger}
                      onClick={() => setPopupOpen(!popupOpen)}
                      className="inline-flex mt-10 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10">
                      Add Profile
                    </button>
                    {popupOpen && (
                          <div
                            ref={popup}
                            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                          >
                            <div
                              className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-5 pb-5 px-7 shadow-md"
                              style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                            >
                              <div className="flex flex-row justify-between">
                                <h2 className="text-xl font-semibold mb-4">Add Social Media Details</h2>
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
                              <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                              <div className="w-full xl:w-1/2">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Social Platform
                                  </label>
                                  <div className={`relative ${formData.platform ? 'bg-light-blue' : ''}`}>
                                  <select
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                                        <option value="">Select Platform</option>                        
                                        <option value="Twitter">Twitter</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Github">Github</option>
                                        <option value="Twitch">Twitch</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="TikTok">TikTok</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Thread">Thread</option>
                                        <option value="Reddit">Reddit</option>
                                        <option value="Discord">Discord</option>
                                        <option value="Slack">Slack</option>
                                        <option value="StackOverflow">StackOverflow</option>
                                      </select>
                                      </div>
                                </div>

                                <div className="w-full xl:w-3/5">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Username/Handle
                                  </label>
                                  <div className={`relative ${formData.username ? 'bg-light-blue' : ''}`}>
                                  <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Mcnobledev"
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">                                   
                                <div className="w-full xl:w-2/2">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    URL
                                  </label>
                                  <div className={`relative ${formData.url ? 'bg-light-blue' : ''}`}>
                                  <input
                                    type="text"
                                    name="url"
                                    value={formData.url}
                                    required
                                    onChange={handleInputChange}
                                    placeholder="https://twitter.com/xyz"
                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                  </div>
                                </div>
                              </div>

                            </div>
                              </form>
                                <button
                                  type="button"
                                  onClick={handleAddProfile}
                                  disabled={loading}
                                  className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {loading ? (
                                    <div className="flex items-center">
                                      <div className="spinner"></div>
                                      <span className="pl-1">Creating...</span>
                                    </div>
                                  ) : (
                                    <>Add Details</>
                                  )}
                                </button>
                            </div>
                          </div>
                        )}
                  </div>
                  <div className='flex flex-row'>
                    <img src={Image} width={120} height={120} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
              <div className="lg:mx-5 flex flex-col rounded-lg border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
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
                  <div className="py-6 px-4 md:px-6 xl:px-7.5 ">
                    <h4 className="text-xl font-semibold text-black dark:text-white">
                      Social Media Accounts
                    </h4>
                  </div>
                  
                  {socialData. length > 0 ? ( 
                  <div className='overflow-x-auto '>
                    <div className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
                      <div className="col-span-2 items-center">
                        <p className="font-medium">Platform</p>
                      </div>
                      <div className="col-span-1 items-center">
                        <p className="font-medium">Handle</p>
                      </div>
                      <div className="col-span-3 items-center">
                        <p className="font-medium">URL</p>
                      </div>
                      <div className="col-span-2 items-center">
                        <p className="font-medium">Actions</p>
                      </div>
                    </div>

                  
                  {/* <div className=""> */}
                    {socialData.map((user, index) => (
                      <div
                        key={user.recordId}
                        className="grid grid-cols-8 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
                      >
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img
                                src={ user.platform === 'Behance' ? Behance : user.platform === 'Discord' ? Discord : user.platform === 'Instagram' ? Instagram : user.platform === 'Twitter' ? Twitter : user.platform === 'Facebook' ? Facebook : user.platform === 'Whatsapp' ? Whatsapp : user.platform === 'Slack' ? Slack : user.platform === 'Twitch' ? Twitch : user.platform === 'LinkedIn' ? LinkedIn : user.platform === 'Snapchat' ? Snapchat : user.platform === 'Telegram' ? Telegram : user.platform === 'Tiktok' ? Tiktok : user.platform === 'Youtube' ? Youtube : user.platform === 'Skype' ? Skype : user.platform === 'Line' ? Line : X}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="ml-3 font-medium">{showDetails ? user.platform : '********'}</p>
                          </div>
                        </div>
                        <div className="col-span-1 items-center sm:flex">
                          <p className="font-medium">{showDetails ? user.username : '********'}</p>
                        </div>
                        <div className="col-span-3 flex flex-row flex-wrap items-center">
                          <p className="font-medium">{showDetails ? user.url : '********'}</p>
                        </div>
                        <div className="col-span-2 flex flex-row gap-4">
                          <button
                            onClick={() => togglePopup(user.recordId)}
                            className="rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90">
                          Edit
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
                                        <h2 className="text-xl font-semibold mb-4">Edit Social Details</h2>
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
                                    <div className="w-full xl:w-1/2">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                      Social Platform
                                    </label>
                                    <div className={`relative ${formData.platform ? 'bg-light-blue' : ''}`}>
                                    <select
                                          name="platform"
                                          value={formData.platform}
                                          onChange={handleInputChange}
                                          required
                                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                                          <option value="">Select Platform</option>                        
                                          <option value="Twitter">Twitter</option>
                                          <option value="LinkedIn">LinkedIn</option>
                                          <option value="Facebook">Facebook</option>
                                          <option value="Github">Github</option>
                                          <option value="Twitch">Twitch</option>
                                          <option value="YouTube">YouTube</option>
                                          <option value="TikTok">TikTok</option>
                                          <option value="Instagram">Instagram</option>
                                          <option value="Thread">Thread</option>
                                          <option value="Reddit">Reddit</option>
                                          <option value="Discord">Discord</option>
                                          <option value="Slack">Slack</option>
                                          <option value="StackOverflow">StackOverflow</option>
                                        </select>
                                        </div>
                                  </div>

                                  <div className="w-full xl:w-3/5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                      Username/Handle
                                    </label>
                                    <div className={`relative ${formData.username ? 'bg-light-blue' : ''}`}>
                                    <input
                                      type="text"
                                      name="username"
                                      required
                                      value={formData.username}
                                      onChange={handleInputChange}
                                      placeholder="Mcnobledev"
                                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">                                   
                                  <div className="w-full xl:w-2/2">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                      URL
                                    </label>
                                    <div className={`relative ${formData.url ? 'bg-light-blue' : ''}`}>
                                    <input
                                      type="text"
                                      name="url"
                                      value={formData.url}
                                      required
                                      onChange={handleInputChange}
                                      placeholder="https://twitter.com/xyz"
                                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                    </div>
                                  </div>
                                </div>

                              </div>
                                </form>
                                    <button
                                      type="button"
                                      onClick={() => updateSocialDetails(user.recordId, formData)}
                                      disabled={updateLoading}
                                      className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                      {updateLoading ? (
                                        <div className="flex items-center">
                                          <div className="spinner"></div>
                                          <span className="pl-1">Updating...</span>
                                        </div>
                                      ) : (
                                        <>Update Details</>
                                      )}
                                    </button>
                                    </div>
                                </div>
                              )}
                          <button
                            onClick={() => showDeleteConfirmation(user.recordId)}
                            className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                            >
                            Delete
                          </button>
                          {isDeleteConfirmationVisible && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                              <div className="bg-white p-5 rounded-lg shadow-md">
                                <p>Are you sure you want to delete this record?</p>
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
                                      deleteSocialDetails(user.recordId);
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

export default Social;
