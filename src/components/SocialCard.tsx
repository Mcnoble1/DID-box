import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
// import Select from 'react-select';
// import useWeb5 from '../hooks/useWeb5';  
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../pages/signin.css';
import Image from '../images/user/2.png';
const ProfileCard = () => {

  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);

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

  const [popupOpen, setPopupOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipientDid, setRecipientDid] = useState('');
  const [formData, setFormData] = useState<{ url: string, username: string; platform: string;}>({
    username: '',
    platform: '',
    url: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
      if (name === 'username' || name === 'platform') {
        const letterRegex = /^[A-Za-z\s]+$/;
        if (!value.match(letterRegex) && value !== '') {
          return;
        }
      }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const profileProtocolDefinition = () => {
    return {
      protocol: "https://did-box.com",
      published: true,
      types: {
        personalDetails: {
          schema: "https://did-box.com/schemas/personalDetails",
          dataFormats: ["application/json"],
        },
        healthDetails: {
          schema: "https://did-box.com/schemas/healthDetails",
          dataFormats: ["application/json"],
        },
        educationDetails: {
          schema: "https://did-box.com/schemas/educationDetails",
          dataFormats: ["application/json"],
        },
        professionDetails: {
          schema: "https://did-box.com/schemas/workDetails",
          dataFormats: ["application/json"],
        },
        financialDetails: {
          schema: "https://did-box.com/schemas/financialDetails",
          dataFormats: ["application/json"],
        },
        sportDetails: {
          schema: "https://did-box.com/schemas/sportDetails",
          dataFormats: ["application/json"],
        },
        socialDetails: {
          schema: "https://did-box.com/schemas/socialDetails",
          dataFormats: ["application/json"],
        },
        entertainmentDetails: {
          schema: "https://did-box.com/schemas/entertainmentDetails",
          dataFormats: ["application/json"],
        },
        reviewDetails: {
          schema: "https://did-box.com/schemas/reviewDetails",
          dataFormats: ["application/json"],
        },
        otherDetails: {
          schema: "https://did-box.com/schemas/otherDetails",
          dataFormats: ["application/json"],
        },
      },
      structure: {
        personalDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "personalDetails", can: "read" },
          ],
        },
        healthDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "healthDetails", can: "read" },
          ],
        },
        educationDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "educationDetails", can: "read" },
          ],
        },
        professionDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "professionDetails", can: "read" },
          ],
        },
        financialDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "financialDetails", can: "read" },
          ],
        },
        sportDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "sportDetails", can: "read" },
          ],
        },
        socialDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "socialDetails", can: "read" },
          ],
        },
        entertainmentDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "entertainmentDetails", can: "read" },
          ],
        },
        reviewDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "reviewDetails", can: "read" },
          ],
        },
        otherDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "otherDetails", can: "read" },
          ],
        },
      },
    };
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
    console.log(formData);
    record = await writeProfileToDwn(formData);

    if (record) {
      const { status } = await record.send(myDid);
      console.log("Send record status in handleAddProfile", status);
    } else {
      toast.error('Failed to create personal record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
        });
        setLoading(false);
      throw new Error('Failed to create personal record');       
    }

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
      const personalProtocol = profileProtocolDefinition();
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
      console.log('Successfully wrote social details to DWN:', record);
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

 

  return (
    <div className="w-full md:w-3/5 flex justify-between rounded-lg border border-stroke bg-white py-7.5 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
       <div className="">
          <h4 className="text-2xl font-bold text-black dark:text-white">
            Social Details
          </h4>
          <button
            ref={trigger}
            onClick={() => setPopupOpen(!popupOpen)}
            className="inline-flex mt-30 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10">
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
        <div>
          <img src={Image} width={200} height={200} />
        </div>
      </div>
  );
};

export default ProfileCard;
