import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import Select from 'react-select';
import Image from '../images/user/7.png';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../pages/signin.css';
const ProfessionalCard = () => {
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
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<{ name: string; company: string; bio: string; role: string; startDate: string; endDate: string; }>({
    name: '',
    bio: '',
    role: '',
    startDate: '',
    endDate: '',
    company: '',
    // image: null,
  });

  const profileProtocolDefinition = () => {
    return {
      protocol: "https://did-box.com",
      published: true,
      types: {
        educationDetails: {
          schema: "https://did-box.com/schemas/educationDetails",
          dataFormats: ["application/json"],
        },
        healthDetails: {
          schema: "https://did-box.com/schemas/healthDetails",
          dataFormats: ["application/json"],
        },
        professionDetails: {
          schema: "https://did-box.com/schemas/professionDetails",
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
        educationDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "educationDetails", can: "read" },
          ],
        },
        healthDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "healthDetails", can: "read" },
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    const file = e.target.files?.[0];
  
      if (file) {
        setSelectedFileName(file.name);
      }
  
      if (name === 'phone' ) {
        const phoneRegex = /^[+]?[0-9\b]+$/;
          
        if (!value.match(phoneRegex) && value !== '') {
          return;
        }
      } else if (name === 'name' || name === 'nationality' || name === 'language') {
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

  const handleAddProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); 
  
    // const requiredFields = ['name', 'gender', 'phone', 'nationality', 'language', 'address'];
    // const emptyFields = requiredFields.filter((field) => !formData[field]);
  
    // if (emptyFields.length > 0) {
    //   toast.error('Please fill in all required fields.', {
    //     position: toast.POSITION.TOP_RIGHT,
    //     autoClose: 3000, 
    //   });
    //   requiredFields.forEach((field) => {
    //     if (!formData[field]) {
    //       const inputElement = document.querySelector(`[name="${field}"]`);
    //       if (inputElement) {
    //         inputElement.parentElement?.classList.add('error-outline');
    //       }
    //     }
    //   });
    //   setLoading(false);
    //   return; 
    // }
      
    const formdata = new FormData();
    formdata.append('name', formData.name);
    formdata.append('bio', formData.bio);
    formdata.append('role', formData.role);  
    formdata.append('company', formData.company);  
    formdata.append('startDate', formData.startDate);
    formdata.append('endDate', formData.endDate);  
    // formdata.append("image", fileInputRef.current.files[0], fileInputRef.current.files[0]?.name);
  
  
    try {
      let record;
      console.log(formData);
      record = await writeProfileToDwn(formData);
      console.log(record);
      if (record) {
        const { status } = await record.send(myDid);
        console.log("Send record status in handleAddProfile", status);
      } else {
        toast.error('Failed to create professional record', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
          });
          setLoading(false);
        throw new Error('Failed to create professional record');       
      }
  
      setFormData({
        name: '',
        bio: '',
        role: '',
        startDate: '',
        endDate: '',
        company: '',
        // image: null,
      });
  
      setPopupOpen(false);
      toast.success('Successfully created professional record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
  
      setLoading(false);
  
    } catch (err) {
        console.error('Error in handleAddProfile:', err);
        toast.error('Error in handleAddProfile. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000, // Adjust the duration as needed
        });
        setLoading(false);
      } 
  };
  
     const writeProfileToDwn = async (profileData) => {
      try {
        const professionProtocol = profileProtocolDefinition();
        const { record, status } = await web5.dwn.records.write({
          data: profileData,
          message: {
            protocol: professionProtocol.protocol,
            protocolPath: 'professionDetails',
            schema: professionProtocol.types.professionDetails.schema,
            recipient: myDid,
          },
        });
        console.log(record);
  
        if (status === 200) {
          return { ...profileData, recordId: record.id}
        } 
        console.log('Successfully wrote professional details to DWN:', record);
        toast.success('Professional Details written to DWN', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        return record;
      } catch (err) {
        console.error('Failed to write professional details to DWN:', err);
        toast.error('Failed to write professional details to DWN. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
     }; 

  return (
    <div className="w-full md:w-3/5 flex justify-between rounded-lg border border-stroke bg-white py-7.5 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
       <div className="">
          <h4 className="text-2xl font-bold text-black dark:text-white">
            Professional Details
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
                    className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                    style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                  >
                    <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold mb-4">Add Professional Details</h2>
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
                    <div className="w-full xl:w-2/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Bio
                        </label>
                        <div className={`relative ${formData.bio ? 'bg-light-blue' : ''}`}>
                        <textarea
                          name="bio"
                          required
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Enter your Bio"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Company
                        </label>
                        <div className={`relative ${formData.company ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="company"
                          required
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="TBD"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Role
                        </label>
                        <div className={`relative ${formData.role ? 'bg-light-blue' : ''}`}>
                        <input
                          type="role"
                          name="role"
                          value={formData.role}
                          required
                          onChange={handleInputChange}
                          placeholder="Software Engineer"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">                                         
                     <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Start Date
                        </label>
                        <div className={`relative ${formData.startDate ? 'bg-light-blue' : ''}`}>
                        <input
                           type="date" 
                          name="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          End Date
                        </label>
                        <div className={`relative ${formData.endDate ? 'bg-light-blue' : ''}`}>
                        <input
                           type="date" 
                          name="endDate"
                          required
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                           
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Name
                        </label>
                        <div className={`relative ${formData.name ? 'bg-light-blue' : ''}`}>
                        <input
                          type="name"
                          name="name"
                          value={formData.name}
                          required
                          onChange={handleInputChange}
                          placeholder="Idowu Festus"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-3">
                      <label className="mb-2.5 block text-black dark:text-white">
                      Image
                      </label>
                      <div
                        id="FileUpload"
                        className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleInputChange}
                          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                        />
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <span className="flex h-5 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                                fill="#3C50E0"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                                fill="#3C50E0"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                                fill="#3C50E0"
                              />
                            </svg>
                          </span>
                          <p>
                            <span className="text-primary">
                            {selectedFileName ? selectedFileName : 'Click to add Image'}                            
                              </span> 
                          </p>
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

export default ProfessionalCard;
