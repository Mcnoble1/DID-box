import React, { useState, useRef, useEffect } from 'react';
import ProductOne from '../images/social/Behance-1.png';
import ProductTwo from '../images/social/Discord-1.png';
import ProductThree from '../images/social/Instagram-1.png';
import ProductFour from '../images/social/Twitter-1.png'
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const SocialDetails = () => {
  // const [socialData, setMediaData] = useState<Social[]>(0);
  const [userToDeleteId, setWorkerToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);

  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ username: string; platform: string; url: string;}>({
    username: '',
    platform: '',
    url: '',
  });

  const socialData = [
    {
      _id: 1,
      name: 'John Doe',
      platform: 'Behance',
      url: 'https://www.behance.net/johndoe',
    },
    {
      _id: 2,
      name: 'John Doe',
      platform: 'Discord',
      url: 'https://discord.com/users/123456789',
    },
    {
      _id: 3,
      name: 'John Doe',
      platform: 'Instagram',
      url: 'https://www.instagram.com/johndoe',
    },
    {
      _id: 4,
      name: 'John Doe',
      platform: 'Twitter',
      url: 'https://twitter.com/johndoe',
    },
  ];

  const popup = useRef<HTMLDivElement | null>(null);

  const togglePopup = (userId: number) => {
    socialData.map((user) => { 
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


  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));
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
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Social Media Accounts
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">Platform</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">Handle</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">URL</p>
        </div>
      </div>

      {socialData.map((user, index) => (
        <div
          key={user._id}
          className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
        >
          <div className="col-span-3 flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user.platform === 'Behance' ? ProductOne : user.platform === 'Discord' ? ProductTwo : user.platform === 'Instagram' ? ProductThree : ProductFour}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="ml-3 font-medium">{user.platform}</p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">{user.url}</p>
          </div>
          <div className="col-span-2 flex items-center justify-end">
            <button
              onClick={() => togglePopup(user._id)}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 hover:bg-primary-200 dark:bg-primarydark dark:hover:bg-primarydarkdark"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-500 dark:text-primarydarkdark"
              >
                <path
                  d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0ZM9 16.312C4.935 16.312 1.688 13.065 1.688 9C1.688 4.935 4.935 1.688 9 1.688C13.065 1.688 16.312 4.935 16.312 9C16.312 13.065 13.065 16.312 9 16.312Z"
                  fill="currentColor"
                />
                <path
                  d="M12.375 5.0625C12.375 4.507 11.928 4.0625 11.375 4.0625C10.82 4.0625 10.375 4.507 10.375 5.0625V10.375C10.375 10.93 10.82 11.375 11.375 11.375C11.928 11.375 12.375 10.93 12.375 10.375V5.0625Z"
                  fill="currentColor"
                />
                <path
                  d="M9.625 5.0625C9.625 4.507 9.18 4.0625 8.625 4.0625C8.07 4.0625 7.625 4.507 7.625 5.0625V10.375C7.625 10.93 8.07 11.375 8.625 11.375C9.18 11.375 9.625 10.93 9.625 10.375V5.0625Z"
                  fill="currentColor"
                />
                <path
                  d="M6.625 5.0625C6.625 4.507 6.18 4.0625 5.625 4.0625C5.07 4.0625 4.625 4.507 4.625 5.0625V10.375C4.625 10.93 5.07 11.375 5.625 11.375C6.18 11.375 6.625 10.93 6.625 10.375V5.0625Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              onClick={() => showDeleteConfirmation(user._id)}
              className="ml-2 flex items-center justify-center w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-red-500 dark:text-red-800"
              >
                <path
                  d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0ZM9 16.312C4.935 16.312 1.688 13.065 1.688 9C1.688 4.935 4.935 1.688 9 1.688C13.065 1.688 16.312 4.935 16.312 9C16.312 13.065 13.065 16.312 9 16.312Z"
                  fill="currentColor"
                />
                <path
                  d="M12.375 5.0625C12.375 4.507 11.928 4.0625 11.375 4.0625C10.82 4.0625 10.375 4.507 10.375 5.0625V10.375C10.375 10.93 10.82 11.375 11.375 11.375C11.928 11.375 12.375 10.93 12.375 10.375V5.0625Z"
                  fill="currentColor"
                />
                <path
                  d="M9.625 5.0625C9.625 4.507 9.18 4.0625 8.625 4.0625C8.07 4.0625 7.625 4.507 7.625 5.0625V10.375C7.625 10.93 8.07 11.375 8.625 11.375C9.18 11.375 9.625 10.93 9.625 10.375V5.0625Z"
                  fill="currentColor"
                />
                <path
                  d="M6.625 5.0625C6.625 4.507 6.18 4.0625 5.625 4.0625C5.07 4.0625 4.625 4.507 4.625 5.0625V10.375C4.625 10.93 5.07 11.375 5.625 11.375C6.18 11.375 6.625 10.93 6.625 10.375V5.0625Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
            {popupOpenMap[user._id] && (
              <div
                ref={popup}
                className="absolute top-0 left-0 z-10 w-full h-full flex items-center justify-center"
              >
                <div
                  onClick={() => closePopup(user._id)}
                  className="absolute top-0 left-0 z-0 w-full h-full bg-black opacity-50"
                ></div>
                <div className="relative z-10 w-11/12 max-w-2xl mx-auto rounded-lg overflow-hidden">
                  <div className="bg-white dark:bg-boxdark">
                    <div className="py-6 px-4 md:px-6 xl:px-7.5">
                      <h4 className="text-xl font-semibold text-black dark:text-white">
                        Edit Social Media Account
                      </h4>
                    </div>

                    <div className="pb-6 px-4 md:px-6 xl:px-7.5">
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            Username
                          </label>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            autoComplete="given-name"
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-boxdarkdark dark:border-boxdarkdark"
                            value={formData.username}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="platform"
                            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            Platform
                          </label>
                          <select
                            id="platform"
                            name="platform"
                            autoComplete="platform"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-boxdarkdark dark:border-boxdarkdark"
                            value={formData.platform}
                            onChange={handleInputChange}
                          >
                            <option>Behance</option>
                            <option>Discord</option>
                            <option>Instagram</option>
                            <option>Twitter</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      ))}
      </div>
    </div>
  );
};

export default SocialDetails;
