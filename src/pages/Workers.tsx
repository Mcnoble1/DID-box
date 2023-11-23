import React, { useEffect, useRef, useState, ChangeEvent, FormEvent } from 'react';
import Select from 'react-select';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import WorkersTable from '../components/WorkersTable';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './signin.css';


const Tables: React.FC = () => {
    const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<{ name: string; dateofbirth: string; gender: string; phone: string; whatsapp: string; area: string; block: string; address: string; nationality: string; category: string; service: string[]; languages: string[]; lengthOfService: string; familyInKuwait: string; petFriendly: string; image: File | null }>({
    name: '',
    gender: '',
    phone: '',
    whatsapp: '',
    area: '',
    address: '',
    block: '',
    nationality: '',
    dateofbirth: '',
    languages: [],
    service: [],
    category: '',
    lengthOfService: '',
    familyInKuwait: '',
    petFriendly: '',
    image: null,
  });

  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  // Data for areas and number of blocks
  const areaData = {
    "Bneid Al Gar": 3,
    "Fahaheel": 14,
    "Farwaniya": 6,
    "Hawally": 12,
    "Jabriya": 12,
    "Jleeb": 5,
    "Mangaf": 5,
    "Kuwait City": 15,
    "Rumaithiya": 11,
    "Salmiya": 12,
    "Salwa": 12,
    "Sharq": 8,
    "Khaitan": 10,
    "Others": 0, // You can set this to 0 or any other default value
  };

  // Get the selected area's block count
  const selectedAreaBlocks = areaData[formData.area];

  useEffect(() => {
    // Check if the user is signed in, otherwise redirect to the sign-in page
    const isSignedIn = localStorage.getItem('token');
    if (!isSignedIn) {
      navigate('/signin');
    } else {
      navigate('/workers');
    }
  }, [navigate]);
  
  const serviceOptions = selectedCategory?.service.map((service) => ({
    value: service._id,
    label: service.name,
  }));

  // Modify the handleServiceChange function
const handleServiceChange = (selectedOptions: any) => {
  setSelectedServices(selectedOptions);
  setFormData((prevData) => ({
    ...prevData,
    service: selectedOptions.map((option: any) => option.value),
  }));
};


  const trigger = useRef<HTMLDivElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showSuccessNotification = () => {
    toast.success('Worker created successfully!', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000, 
    });
  };


 useEffect(() => {
  const keyHandler = ({ keyCode }: { keyCode: number }) => {
    if (!popupOpen || keyCode !== 27) return;
    setPopupOpen(false);
  };
  document.addEventListener('keydown', keyHandler);
  return () => document.removeEventListener('keydown', keyHandler);
}, [popupOpen]);

useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchCategories();
}, []);

const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  const file = e.target.files?.[0];

    if (file) {
      setSelectedFileName(file.name);
    }

    if (name === 'phone' || name === 'whatsapp' || name === 'dateofbirth') {
      // Use a regular expression to allow only phone numbers starting with a plus
      const phoneRegex = /^[+]?[0-9\b]+$/;
        
      if (!value.match(phoneRegex) && value !== '') {
        // If the input value doesn't match the regex and it's not an empty string, do not update the state
        return;
      }
    } else if (name === 'name' || name === 'nationality' || name === 'area') {
      // Use a regular expression to allow only letters and spaces
      const letterRegex = /^[A-Za-z\s]+$/;
      if (!value.match(letterRegex) && value !== '') {
        // If the input value doesn't match the regex and it's not an empty string, do not update the state
        return;
      }
    }

  if (name === 'category') {
    // Find the selected category object from the categories array
    const selectedCategoryObject = categories.find((category) => category._id === value);

    setSelectedCategory(selectedCategoryObject || null);

    setFormData((prevData) => ({
      ...prevData,
      service: [], // Clear the selected service
    }));
  }

  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

  
  const handleAddWorker = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start the loading state

    // Validate the form fields
  const requiredFields = ['name', 'gender', 'phone', 'category', 'nationality', 'languages', 'service', 'dateofbirth', 'whatsapp', 'address', 'area', 'block', 'lengthOfService', 'familyInKuwait', 'petFriendly'];
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

      // Create a FormData object
    const formdata = new FormData();
    formdata.append('name', formData.name);
    formdata.append('gender', formData.gender);
    formdata.append('phone', formData.phone);
    formdata.append('category', formData.category);
    formdata.append('nationality', formData.nationality);
    for (let i = 0; i < formData.languages.length; i++) {
      formdata.append('languages[]', formData.languages[i]);
    } 
    for (let i = 0; i < formData.service.length; i++) {
      formdata.append('service[]', formData.service[i]);
    }
    formdata.append('dateofbirth', formData.dateofbirth);
    formdata.append('whatsapp', formData.whatsapp);
    formdata.append('address', formData.address);
    formdata.append('area', formData.area);
    formdata.append('block', formData.block);
    formdata.append('lengthOfService', formData.lengthOfService);
    formdata.append('familyInKuwait', formData.familyInKuwait);
    formdata.append('petFriendly', formData.petFriendly);
    formdata.append("image", fileInputRef.current.files[0], fileInputRef.current.files[0].name);


    try {
    const url = 'https://madad.onrender.com/api/admin/worker/create';
    const token = localStorage.getItem('token') || '';

     // Make the POST request using Axios
     axios
     .post(url, formdata, {
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'multipart/form-data',
       },
     })
     .then((response) => {
       // Add any success handling logic here
       setPopupOpen(false);
   // Check if the category was successfully created
   if (response.status === 200) {
     showSuccessNotification();

      // Clear the form
      setFormData({
        name: '',
        gender: '',
        phone: '',
        whatsapp: '',
        area: '',
        address: '',
        block: '',
        nationality: '',
        languages: [],
        service: [],
        dateofbirth: '',
        category: '',
        lengthOfService: '',
        familyInKuwait: '',
        petFriendly: '',
        image: null,
      });

      // reload the page
      window.location.reload();


   } else {
     // Handle any other response status codes (e.g., validation errors)
      console.error('Failed to create worker details:', response.data);
      toast.error('Failed to create worker. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000, // Adjust the duration as needed
      });
     }})
 } catch (error) {
   console.error('Error creating Worker:', error);
   // Show an error notification for the API request failure
   toast.error('Failed to create worker. Please try again later.', {
     position: toast.POSITION.TOP_RIGHT,
     autoClose: 5000, // Adjust the duration as needed
   });
 } finally {
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
                <Breadcrumb pageName="Workers" />
                <nav 
                ref={trigger}
                onClick={() => setPopupOpen(!popupOpen)}
                className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                  Add Worker
                </nav>
              </div>

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
                      <h2 className="text-xl font-semibold mb-4">Add Worker</h2>
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
                    <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Worker's Name
                        </label>
                        <div className={`relative ${formData.name ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Bam Bam"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Gender
                        </label>
                        <div className={`relative ${formData.gender ? 'bg-light-blue' : ''}`}>
                        <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              required
                              placeholder="Yes"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select Gender</option>
                              <option value="Yes">Male</option>
                              <option value="No">Female</option>
                            </select>
                        </div>
                      </div>

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Year of Birth
                        </label>
                        <div className={`relative ${formData.dateofbirth ? 'bg-light-blue' : ''}`}>
                        <input
                           type="text" 
                           maxLength={4}
                           step="1" 
                           placeholder='YYYY'
                          name="dateofbirth"
                          required
                          value={formData.dateofbirth}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Nationality
                        </label>
                        <div className={`relative ${formData.nationality ? 'bg-light-blue' : ''}`}>
                        <select
                              name="nationality"
                              value={formData.nationality}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select Nationality</option>
                              <option value="India">India</option>
                              <option value="Pakistan">Pakistan</option>
                              <option value="Bangladesh">Bangladesh</option>
                              <option value="Nepal">Nepal</option>
                              <option value="Sri Lanka">Sri Lanka</option>
                              <option value="Philippines">Philippines</option>
                              <option value="Others">Others</option>
                            </select>
                            </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">Languages</label>
                      <div className={`relative ${formData.languages.length ? 'bg-light-blue' : ''}`}>
                        <Select
                          isMulti
                          name="languages"
                          closeMenuOnSelect={false}
                          value={formData.languages.map((lang) => ({ label: lang, value: lang }))}
                          onChange={(selectedOptions) => {
                            const selectedLanguages = selectedOptions.map((option) => option.value);
                            setFormData((prevData) => ({
                              ...prevData,
                              languages: selectedLanguages,
                            }));
                          }}
                          options={[
                            { label: 'English', value: 'English' },
                            { label: 'Arabic', value: 'Arabic' },
                            { label: 'Hindi', value: 'Hindi' },
                            { label: 'Punjabi', value: 'Punjabi' },
                            { label: 'Tamil', value: 'Tamil' },
                            { label: 'Telugu', value: 'Telugu' },
                            { label: 'Malayalam', value: 'Malayalam' },
                            { label: 'Marathi', value: 'Marathi' },
                            { label: 'Kannada', value: 'Kannada' },
                            { label: 'Gujarati', value: 'Gujarati' },
                            { label: 'Nepali', value: 'Nepali' },
                            { label: 'Bengali', value: 'Bengali' },
                            { label: 'Sinhala', value: 'Sinhala' },
                            { label: 'Filipono', value: 'Filipono' },
                            { label: 'Others', value: 'Others' },
                          ]}
                          placeholder="Select language(s)"
                        />
                      </div>
                    </div>



                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Whatsapp
                        </label>
                        <div className={`relative ${formData.whatsapp ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="whatsapp"
                          required
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="+23476543210"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Phone
                        </label>
                        <div className={`relative ${formData.phone ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          required
                          onChange={handleInputChange}
                          placeholder="+234123456789"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                        <div className="w-full xl:w-1/2">
                          <label className="mb-2.5 block text-black dark:text-white">Area</label>
                          <div className={`relative ${formData.area ? 'bg-light-blue' : ''}`}>
                            <select
                              name="area"
                              value={formData.area}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                            >
                              <option value="">Select Area</option>
                              {Object.keys(areaData).map((area) => (
                                <option key={area} value={area}>
                                  {area}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="w-full xl:w-1/2">
                          <label className="mb-2.5 block text-black dark:text-white">Block</label>
                          <div className={`relative ${formData.block ? 'bg-light-blue' : ''}`}>
                            <select
                              name="block"
                              value={formData.block}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                            >
                              <option value="">Select Block</option>
                              {/* Generate options for the selected area's block count */}
                              {selectedAreaBlocks > 0 && [...Array(selectedAreaBlocks).keys()].map((block) => (
                                <option key={block} value={block + 1}>
                                  {block + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                      <div className="w-full xl:w-1/2">
                          <label className="mb-2.5 block text-black dark:text-white">
                            Category
                          </label>
                          <div className={`relative ${formData.category ? 'bg-light-blue' : ''}`}>
                            <select
                            name="category"
                            value={selectedCategory?._id || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          </div>
                        </div>
                        
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Service
                        </label>
                        <div className={`relative ${selectedServices ? 'bg-light-blue' : ''}`}>
                        <Select
                              isMulti
                              name="service"
                              value={selectedServices}
                              onChange={handleServiceChange}
                              options={serviceOptions}
                              placeholder="Select service(s)"
                              
                            />
                          </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Address
                        </label>
                        <div className={`relative ${formData.address ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          required
                          onChange={handleInputChange}
                          placeholder="7 10 Marakesh Street"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Length of Service
                        </label>
                        <div className={`relative ${formData.lengthOfService ? 'bg-light-blue' : ''}`}>
                        <select
                              name="lengthOfService"
                              value={formData.lengthOfService}
                              onChange={handleInputChange}
                              required
                              placeholder="Full Time"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select</option>
                              <option value="Full Time">Full Time</option>
                              <option value="Part Time">Part Time</option>
                            </select>
                          </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Family in Kuwait
                        </label>
                        <div className={`relative ${formData.familyInKuwait ? 'bg-light-blue' : ''}`}>
                        <select
                              name="familyInKuwait"
                              value={formData.familyInKuwait}
                              onChange={handleInputChange}
                              required
                              placeholder="Yes"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Petfriendly
                        </label>
                        <div className={`relative ${formData.petFriendly ? 'bg-light-blue' : ''}`}>
                        <select
                              name="petFriendly"
                              value={formData.petFriendly}
                              onChange={handleInputChange}
                              required
                              placeholder="Yes"
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-3">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Worker Image
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
                        onClick={handleAddWorker}
                        disabled={loading}
                        className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="spinner"></div>
                            <span className="pl-1">Creating...</span>
                          </div>
                        ) : (
                          <>Add Worker</>
                        )}
                      </button>



                  </div>
                </div>
              )}

              <div className="flex flex-col gap-10">
                <WorkersTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Tables;