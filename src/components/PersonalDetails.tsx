import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';

const PersonalDetails = () => {
  const [usersData, setUsersData] = useState<User[]>(0);
  const [workerToDeleteId, setWorkerToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ name: string; dateofbirth: string; gender: string; phone: string; address: string; nationality: string; languages: string[]; image: File | null }>({
    name: '',
    gender: '',
    phone: '',
    address: '',
    nationality: '',
    languages: [],
    dateofbirth: '',
    image: null,
  });
  const [showDetails, setShowDetails] = useState(false);

  const usersDetails = [
    { name: 'Mcnoble Don',
      gender: 'Male',
      email: 'mcnoble@gmail.com',
      phone: '+23412345678',
      address: '7 Kutan Estate, Lagos',
      dateofbirth: 'March 12, 1700',
      nationality: 'Nigerian',
      languages: ['English', 'French'],
    },
  ];

  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleDetails = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  };

  const togglePopup = (userId: number) => {
    usersDetails.map((user) => { 
      if (user._id === userId) {
        setFormData({
         name: user.name,
         gender: user.gender,
          phone: user.phone,
          email: user.email,
          address: user.address,
          nationality: user.nationality,
          dateofbirth: user.dateofbirth,
          languages: user.languages,
          image: null,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [workerId]: !prevMap[workerId],
    }));
  };
  
// Function to close the popup for a specific worker
const closePopup = (workerId: number) => {
  setPopupOpenMap((prevMap) => ({
    ...prevMap,
    [workerId]: false,
  }));
};

const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  if (name === 'phone') {
    // Use a regular expression to allow only phone numbers starting with a plus
    const phoneRegex = /^[+]?[0-9\b]+$/;
      
    if (!value.match(phoneRegex) && value !== '') {
      // If the input value doesn't match the regex and it's not an empty string, do not update the state
      return;
    }
  } else if (name === 'name' || name === 'nationality' ) {
    // Use a regular expression to allow only letters and spaces
    const letterRegex = /^[A-Za-z\s]+$/;
    if (!value.match(letterRegex) && value !== '') {
      // If the input value doesn't match the regex and it's not an empty string, do not update the state
      return;
    }
  }

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));

  const file = e.target.files?.[0];

  if (file) {
    setSelectedFileName(file.name);
  }
};

const showDeleteConfirmation = (workerId: number) => {
    setWorkerToDeleteId(workerId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setWorkerToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };

  const handleEdit = (workerId: number ) => {

    };


  const handleDelete = (workerId: number) => {
    
  }

  useEffect(() => {
   
  }, []);

  return (
    <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
      {usersDetails.map((user, index) => (
      <div className="flex flex-wrap w-full" key={index}>
        <div className='w-1/2 mb-5' >
          <span className="text-xl">Name</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.name : '********'}
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Email</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.email : '********'}
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Phone Number</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.phone : '********'}
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Address</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.address : '********'}
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Date of Birth</span>
          <h4 className={`text-xl mt-1 font-medium text-black dark:text-white}`}>
            {showDetails ? user.dateofbirth : '********'}
          </h4>
        </div> 

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Nationality</span>
          <h4 className={`text-xl mt-1 font-medium text-black dark:text-white}`}>
            {showDetails ? user.nationality : '********'}
          </h4>
        </div> 

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Languages</span>
          <h4 className={`text-xl mt-1 font-medium text-black dark:text-white}`}>
            {showDetails ? user.languages : '********'}
          </h4>
        </div> 
      </div>
      ))}
      <div className="flex flex-row flex-wrap justify-evenly gap-2">
            <div className="relative">
              <button
                // onClick={toggleSortDropdown}
                className="inline-flex items-center justify-center rounded-full bg-success py-3 px-7 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
                Share
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => togglePopup(5)}                      
                className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                >
                Edit
              </button>
                {popupOpenMap[4] && (
                      <div
                        ref={popup}
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                      >
                        <div
                            className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                            style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                          >              
                              <div className="flex flex-row justify-between">
                              <h2 className="text-xl font-semibold mb-4">Edit Worker</h2>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => closePopup(worker._id)}
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
                            <div className=" rounded-sm px-6.5 bg-white dark:border-strokedark dark:bg-boxdark">
                                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                  <div className="w-full xl:w-3/5">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Worker's Name
                                      </label>
                                      <div className={`relative ${formData.name ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"                                             
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Bam Bam"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>

                                    <div className="w-full xl:w-2/5">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Gender
                                      </label>
                                      <div className={`relative ${formData.gender ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        placeholder="Male"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>

                                    <div className="w-full xl:w-2/5">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Date of Birth
                                      </label>
                                      <div className={`relative ${formData.dateofbirth ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text" 
                                        maxLength={4}
                                        name="dateofbirth"
                                        value={formData.dateofbirth}
                                        onChange={handleInputChange}
                                        placeholder="1990"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Nationality
                                      </label>
                                      <div className={`relative ${formData.nationality ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        placeholder="American"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>

                                    <div className="w-full xl:w-1/2">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Languages
                                      </label>
                                      
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
                                        value={formData.whatsapp}
                                        onChange={handleInputChange}
                                        placeholder="+23476543210"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>

                                    <div className="w-full xl:w-1/2">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Address
                                      </label>
                                      <div className={`relative ${formData.address ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="7 10 Marakesh Street"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Area
                                      </label>
                                      <div className={`relative ${formData.area ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        placeholder="Kutana"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>

                                    <div className="w-full xl:w-1/2">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Block
                                      </label>
                                      <div className={`relative ${formData.block ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"
                                        name="block"
                                        value={formData.block}
                                        onChange={handleInputChange}
                                        placeholder="4"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                    <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Category
                                        </label>
                                        
                                      </div>
                                  
                                  </div>

                                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                  <div className="w-full xl:w-1/2">
                                      <label className="mb-2.5 block text-black dark:text-white">
                                        Phone
                                      </label>
                                      <div className={`relative ${formData.phone ? 'bg-light-blue' : ''}`}>
                                      <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+234123456789"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                      />
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
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          >
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
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          >
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
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          >
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
                                        name="image"
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
                                <button
                                  type="button"
                                  onClick={() => handleEdit(worker._id)} 
                                  // Close popup on second page
                                  disabled={loading}
                                  className="mr-5 lg:mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                                >
                                  {loading ? (
                                        <div className="flex items-center">
                                          <div className="w-6 h-6 border-t-2 border-primary border-solid rounded-full animate-spin" />
                                          <span>Updating...</span>
                                        </div>
                                      ) : (
                                        <>Update Worker</>
                                      )}
                                </button>
                        
                            </form>
                          </div>
                      </div>
                    )}
            </div>

            <div className="relative">
              <button
                onClick={() => showDeleteConfirmation(4)}
                className="inline-flex items-center justify-center rounded-full bg-danger py-3 px-7 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
              >
                Delete
              </button>
              {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete your record?</p>
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
                                handleDelete(workerToDeleteId);
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
            <div className="relative">
          <button
            onClick={toggleDetails}
            className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
          </div>
    </div>
  );
};

export default PersonalDetails;






