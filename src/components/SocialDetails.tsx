import React, { useState, useRef, useEffect } from 'react';

const PersonalDetails = () => {
  const [usersData, setUsersData] = useState<User[]>(0);
  const [userToDeleteId, setWorkerToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);

  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ username: string; platform: string; url: string;}>({
    username: '',
    platform: '',
    url: '',
  });

  const popup = useRef<HTMLDivElement | null>(null);

  const togglePopup = (userId: number) => {
    usersData.map((user) => { 
      if (user._id === userId) {
        setFormData({
         username: user.name,
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

  if (name === 'phone' || name === 'whatsapp') {
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

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));

  const file = e.target.files?.[0];

  if (file) {
    setSelectedFileName(file.name);
  }
};

const showDeleteConfirmation = (userId: number) => {
    setWorkerToDeleteId(userId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setWorkerToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };

  const handleEdit = (userId: number ) => {

    };


  const handleDelete = (userId: number) => {
    const config = {
      method: 'delete',
      url: `https://madad.onrender.com/api/admin/user/delete/${userId}`,
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };
  }

  useEffect(() => {
   
  }, []);

  return (
    <div className="mx-5 flex flex-col rounded-lg border border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap w-full">
        <div className='w-1/2 mb-5'>
          <span className="text-xl">Name</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            Festus Idowu
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Email</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            idowufestustemiloluwa@gmail.com
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Phone Number</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            +2348067590789
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Address</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            7 Ayelabowo Moore, Ile-Ife
          </h4>
        </div>

        <div className='w-1/2 mb-5'>
          <span className="text-xl">Date of Birth</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            March 4, 2000
          </h4>
        </div>       
      </div>
      <div className="flex justify-evenly gap-2">
            <div className="relative">
              <button
                // onClick={toggleSortDropdown}
                className="inline-flex items-center justify-center rounded-full bg-success py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
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
                                  onClick={() => closePopup(user._id)}
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
                                <button
                                  type="button"
                                  onClick={() => handleEdit(user._id)} 
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
                className="inline-flex items-center justify-center rounded-full bg-danger py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
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
                                handleDelete(userToDeleteId);
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
  );
};

export default PersonalDetails;
