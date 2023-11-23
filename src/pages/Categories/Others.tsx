import React, { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import qs from 'qs';
import { useNavigate } from 'react-router-dom'; 
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Breadcrumb from '../../components/Breadcrumb';
import AllCategoriesTable from '../../components/AllCategoriesTable';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../signin.css';

type FormData = {
  name: string;
  image: File | null;
};

type ServiceFormData = {
  category: string;
  name: string;
};

const Tables: React.FC = () => {
  const navigate = useNavigate();
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [servicePopupOpen, setServicePopupOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // State to store categories


  const [formData, setFormData] = useState<FormData>({
    name: '',
    image: null,
  });

  const [serviceFormData, setServiceFormData] = useState<ServiceFormData>({
    category: '',
    name: '',
  });

  useEffect(() => {
    // Check if the user is signed in, otherwise redirect to the sign-in page
    const isSignedIn = localStorage.getItem('token');
    if (!isSignedIn) {
      navigate('/signin');
    } else {
      navigate('/categories/others');
    }
  }, [navigate]);

  const trigger = useRef<HTMLDivElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showSuccessNotification = () => {
    toast.success('Category created successfully!', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    });
  };

  

  const closePopup = (stateSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    stateSetter(false);
  };

  useEffect(() => {
    // Fetch categories when the component mounts
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.get('https://madad.onrender.com/api/admin/category/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setCategories(response.data.category);
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

     if (name === 'name' ) {
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

    const file = e.target.files?.[0];

    if (file) {
      setSelectedFileName(file.name);
      setFormData((prevData) => ({
        ...prevData,
        image: e.target.files ? e.target.files[0] : null,
      }));
    }

  };

  const handleServiceInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'name' ) {
      // Use a regular expression to allow only letters and spaces
      const letterRegex = /^[A-Za-z\s]+$/;
      if (!value.match(letterRegex) && value !== '') {
        // If the input value doesn't match the regex and it's not an empty string, do not update the state
        return;
      }
    } 
    
    setServiceFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    url: string,
    formData: FormData | ServiceFormData,
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

  const handleAddCategory = (e: FormEvent) => {
    e.preventDefault();

    const requiredFields = ['name', 'image'];
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


    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('image', formData.image!); // Ensure image is not null here
  
    const url = 'https://madad.onrender.com/api/admin/category/create';
    handleSubmit(url, formDataToSend, setCategoryPopupOpen, 'Category created successfully!',);
    
  };


  const handleAddService = async (e: FormEvent) => {
    e.preventDefault();

     const requiredFields = ['name', 'category'];
    const emptyFields = requiredFields.filter((field) => !serviceFormData[field]);
  
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });
      requiredFields.forEach((field) => {
        if (!serviceFormData[field]) {
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
      name: serviceFormData.name,
      category: serviceFormData.category,
    });
  
    const url = 'https://madad.onrender.com/api/admin/service/create';
  
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
        toast.success('Service created successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        closePopup(setServicePopupOpen);

        setServiceFormData({
          category: '',
          name: '',
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
                <Breadcrumb pageName="All Categories" />
                <div>
                <button 
                  ref={trigger}
                  onClick={() => setCategoryPopupOpen(!categoryPopupOpen)}
                  className="inline-flex mr-5 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                    Add Category
                </button>

                <button
                ref={trigger}
                onClick={() => setServicePopupOpen(!servicePopupOpen)}
                className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                  Add Service
              </button>
                </div>   
              </div>

              {categoryPopupOpen && (
                <div
                  ref={popup}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                >
                  {/* Category Popup Form */}
                  <div className="bg-white lg:w-1/2 rounded-lg p-4 shadow-md">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold mb-4">Add Category</h2>
                      <div className="flex justify-end">
                        <button
                          onClick={() => closePopup(setCategoryPopupOpen)}
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
                              Category Name
                            </label>
                            <div className={`relative ${formData.name ? 'bg-light-blue' : ''}`}>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              placeholder="Transportation"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                            </div>
                          </div>
                          {/* Category Image */}
                          <div>
                            <label className="mb-2.5 block text-black dark:text-white">
                              Category Image
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
                      </div>
                      </form>
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={loading}
                        className="mr-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 border-t-2 border-primary border-solid rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <>Add Category</>
                        )}
                      </button>
                    
                  </div>
                </div>
              )}

              {servicePopupOpen && (
                <div
                  ref={popup}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                >
                  {/* Service Popup Form */}
                  <div className="bg-white lg:w-1/2 rounded-lg p-4 shadow-md">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold mb-4">Add Service</h2>
                      <div className="flex justify-end">
                        <button
                          onClick={() => closePopup(setServicePopupOpen)}
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
                              Select Category
                            </label>
                            <div className={`relative ${serviceFormData.category ? 'bg-light-blue' : ''}`}>
                            <select
                              name="category"
                              value={serviceFormData.category}
                              onChange={handleServiceInputChange}
                              required
                              placeholder="Select a category"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                              <option value="">Select a category</option>
                              {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            </div>
                          </div>

                          <div>
                            <label className="mb-3 block text-black dark:text-white">
                              Service Name
                            </label>
                             <div className={`relative ${serviceFormData.name ? 'bg-light-blue' : ''}`}>
                            <input
                              type="text"
                              name="name"
                              value={serviceFormData.name}
                              onChange={handleServiceInputChange}
                              required
                              placeholder="Default Input"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddService}
                        disabled={loading}
                        className="mr-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-6 h-6 border-t-2 border-primary border-solid rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <>Add Service</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            

              <div className="flex flex-col gap-10">
                <AllCategoriesTable />
              </div>
              </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Tables;
