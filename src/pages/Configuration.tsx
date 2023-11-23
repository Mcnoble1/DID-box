  import React, { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import qs from 'qs';
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import DropoffTable from '../components/DropoffTable';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './signin.css';

type FormData = {
  dropoffarea: string;
};

type DropofflandmarkFormData = {
  dropoffarea: string;
  dropofflandmark: string;
};

const Tables: React.FC = () => {
  const navigate = useNavigate();
  const [dropoffareaPopupOpen, setDropoffareaPopupOpen] = useState(false);
  const [dropofflandmarkPopupOpen, setDropofflandmarkPopupOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropoffareas, setDropoffareas] = useState<Dropoffarea[]>([]); // State to store dropoffareas


  const [formData, setFormData] = useState<FormData>({
    dropoffarea: '',
  });

  const [dropofflandmarkFormData, setDropofflandmarkFormData] = useState<DropofflandmarkFormData>({
    dropoffarea: '',
    dropofflandmark: '',
  });

  useEffect(() => {
    // Check if the user is signed in, otherwise redirect to the sign-in page
    const isSignedIn = localStorage.getItem('token');
    if (!isSignedIn) {
      navigate('/signin');
    } else {
      navigate('/configuration');
    }
  }, [navigate]);

  const trigger = useRef<HTMLDivElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);

  const showSuccessNotification = () => {
    toast.success('Dropoffarea created successfully!', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    });
  };

  

  const closePopup = (stateSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    stateSetter(false);
  };

  useEffect(() => {
    // Fetch dropoffareas when the component mounts
    fetchDropoffareas();
  }, []);

  const fetchDropoffareas = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.get('https://madad.onrender.com/api/admin/configuration/get-dropoffareas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setDropoffareas(response.data.dropoffarea);
      } else {
        console.error('API request failed:', response.data);
        // Handle other response status codes
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle the error
    }
  };


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

     if (name === 'dropoffarea' ) {
      // Use a regular expression to allow only letters and spaces
      const letterRegex = /^[A-Za-z\s]+$/;
      if (!value.match(letterRegex) && value !== '') {
        // If the input value doesn't match the regex and it's not an empty string, do not update the state
        return;
      }
    } 


    setFormData((prevData) => ({
      ...prevData,  
      [name]: value,
    }));

  };

  const handleDropofflandmarkInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'dropofflandmark' ) {
      // Use a regular expression to allow only letters and spaces
      const letterRegex = /^[A-Za-z\s]+$/;
      if (!value.match(letterRegex) && value !== '') {
        // If the input value doesn't match the regex and it's not an empty string, do not update the state
        return;
      }
    } 
    
    setDropofflandmarkFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    url: string,
    formData: FormData | DropofflandmarkFormData,
    stateSetter: React.Dispatch<React.SetStateAction<boolean>>,
    successMessage: string
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);

      if (response.status === 200) {
        showSuccessNotification();
        closePopup(stateSetter);

        window.location.reload();
      } else {
        console.error('API request failed:', response.data);
        // Handle other response status codes (e.g., validation errors)
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Request failed. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDropoffarea = async (e: FormEvent) => {
    e.preventDefault();

    const requiredFields = ['dropoffarea'];
    const emptyFields = requiredFields.filter((field) => !formData[field]);
  
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields.', {
        position: toast.POSITION.TOP_RIGHT,   
        autoClose: 3000, // Adjust the duration as needed
      });
      requiredFields.forEach((field) => {
        if (!formData[field]) {
          // Find the corresponding input element and add the error class
          const inputElement = document.querySelector(`[name="${field}"]`);
          if (inputElement) {
            inputElement.parentElement?.classList.add('error-outline');
          }
        }
      });
  
      return; // Prevent form submission
    }

    const data = qs.stringify({
      dropoffarea: formData.dropoffarea,
    });
  
    const url = 'https://madad.onrender.com/api/admin/configuration/create-dropoffarea';
  
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      setLoading(false);
  
      if (response.status === 200) {
        toast.success('Dropoffarea created successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        closePopup(setDropoffareaPopupOpen);

        setFormData({
          dropoffarea: '',
        });

        window.location.reload();

      } else {
        console.error('API request failed:', response.data);
        // Handle other response status codes (e.g., validation errors)
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Request failed. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleAddDropofflandmark = async (e: FormEvent) => {
    e.preventDefault();

     const requiredFields = ['dropofflandmark', 'dropoffarea'];
    const emptyFields = requiredFields.filter((field) => !dropofflandmarkFormData[field]);
  
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });
      requiredFields.forEach((field) => {
        if (!dropofflandmarkFormData[field]) {
          // Find the corresponding input element and add the error class
          const inputElement = document.querySelector(`[name="${field}"]`);
          if (inputElement) {
            inputElement.parentElement?.classList.add('error-outline');
          }
        }
      });
  
      return; // Prevent form submission
    }
  
    const data = qs.stringify({
      dropofflandmark: dropofflandmarkFormData.dropofflandmark,
      dropoffarea: dropofflandmarkFormData.dropoffarea,
    });
  
    const url = 'https://madad.onrender.com/api/admin/configuration/create-dropofflandmark';
  
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      setLoading(false);
  
      if (response.status === 200) {
        toast.success('Dropofflandmark created successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        closePopup(setDropofflandmarkPopupOpen);

        setDropofflandmarkFormData({
          dropoffarea: '',
          dropofflandmark: '',
        });

        window.location.reload();

      } else {
        console.error('API request failed:', response.data);
        // Handle other response status codes (e.g., validation errors)
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Request failed. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
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
              <div className="mb-6 flex flex-row gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Breadcrumb pageName="Configuration" />
                <div>
                <button 
                  ref={trigger}
                  onClick={() => setDropoffareaPopupOpen(!dropoffareaPopupOpen)}
                  className="inline-flex mr-5 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                    Add Dropoff Area
                </button>

                <button
                ref={trigger}
                onClick={() => setDropofflandmarkPopupOpen(!dropofflandmarkPopupOpen)}
                className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                  Add Dropoff Landmark
              </button>
                </div>   
              </div>

              {dropoffareaPopupOpen && (
                <div
                  ref={popup}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                >
                  {/* Dropoffarea Popup Form */}
                  <div className="bg-white lg:w-1/2 rounded-lg p-4 shadow-md">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold">Add Dropoff Aarea</h2>
                      <div className="flex justify-end">
                        <button
                          onClick={() => closePopup(setDropoffareaPopupOpen)}
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
                      <div className="rounded-sm bg-white dark:border-strokedark dark:bg-boxdark">
                        <div className="flex flex-col gap-5.5 p-6.5">
                          <div>
                            <label className="mb-3 block text-black dark:text-white">
                              Dropoff Area
                            </label>
                            <div className={`relative ${formData.dropoffarea ? 'bg-light-blue' : ''}`}>
                            <input
                              type="text"
                              name="dropoffarea"
                              value={formData.dropoffarea}
                              onChange={handleInputChange}
                              required
                              placeholder="Kuwait City"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                            </div>
                          </div>                          
                        </div>
                      </div>
                      </form>
                      <button
                        type="button"
                        onClick={handleAddDropoffarea}
                        disabled={loading}
                        className="mr-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 border-t-2 border-primary border-solid rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <>Add Dropoff Area</>
                        )}
                      </button>
                    
                  </div>
                </div>
              )}

              {dropofflandmarkPopupOpen && (
                <div
                  ref={popup}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                >
                  {/* Dropofflandmark Popup Form */}
                  <div className="bg-white lg:w-1/2 rounded-lg p-4 shadow-md">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold">Add Dropoff Landmark</h2>
                      <div className="flex justify-end">
                        <button
                          onClick={() => closePopup(setDropofflandmarkPopupOpen)}
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
                      <div className="rounded-sm bg-white dark:border-strokedark dark:bg-boxdark">
                        <div className="flex flex-col gap-5.5 p-6.5">
                          <div>
                            <label className="mb-3 block text-black dark:text-white">
                              Dropoff Area
                            </label>
                            <div className={`relative ${dropofflandmarkFormData.dropoffarea ? 'bg-light-blue' : ''}`}>
                            <select
                              name="dropoffarea"
                              value={dropofflandmarkFormData.dropoffarea}
                              onChange={handleDropofflandmarkInputChange}
                              required
                              placeholder="Select a dropoffarea"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                              <option value="">Select a dropoffarea</option>
                              {dropoffareas.map((dropoffarea) => (
                                <option key={dropoffarea._id} value={dropoffarea._id}>
                                  {dropoffarea.dropoffarea}
                                </option>
                              ))}
                            </select>
                            </div>
                          </div>

                          <div>
                            <label className="mb-3 block text-black dark:text-white">
                              Dropoff Landmark
                            </label>
                             <div className={`relative ${dropofflandmarkFormData.dropofflandmark ? 'bg-light-blue' : ''}`}>
                            <input
                              type="text"
                              name="dropofflandmark"
                              value={dropofflandmarkFormData.dropofflandmark}
                              onChange={handleDropofflandmarkInputChange}
                              required
                              placeholder="Kuwait City Mall"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDropofflandmark}
                        disabled={loading}
                        className="mr-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 border-t-2 border-primary border-solid rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <>Add Dropoff Landmark</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            

              <div className="flex flex-col gap-10">
                <DropoffTable />
              </div>
              </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Tables;
