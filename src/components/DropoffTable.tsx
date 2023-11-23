import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios'; // You may need to install axios
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

interface Dropoffarea {
  _id: number;
  dropoffarea: string;
  dropofflandmark: Array<string>;
}

const DropoffTable: React.FC = () => {
  const [dropoffareasData, setDropoffareasData] = useState<Dropoffarea[]>([]);
  const [selectedDropoffarea, setSelectedDropoffarea] = useState<Dropoffarea | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [dropoffareaToDeleteId, setDropoffareaToDeleteId] = useState<number | null>(null);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>(''); 
  const [filterOption, setFilterOption] = useState<string>(''); 
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ dropoffarea: string; }>({
    dropoffarea: '',
  });

  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showDeleteConfirmation = (dropoffareaId: number) => {
    setDropoffareaToDeleteId(dropoffareaId);
    setDeleteConfirmationVisible(true);
  };

  
  const hideDeleteConfirmation = () => {
    setDropoffareaToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };
  
  const togglePopup = (dropoffareaId: number) => {
    dropoffareasData.map((dropoffarea) => { 
      if (dropoffarea._id === dropoffareaId) {
        setFormData({
          dropoffarea: dropoffarea.dropoffarea,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [dropoffareaId]: !prevMap[dropoffareaId],
    }));
  };

  // Function to close the popup for a specific dropoffarea
  const closePopup = (dropoffareaId: number) => {
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [dropoffareaId]: false,
    }));
  };


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

  if (name === 'name' || name === 'image')  {
      // Use a regular expression to allow only letters~ and spaces
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
    }
  };


  const url = "https://madad.onrender.com/api/admin/configuration/get-dropoffareas";
  const token = localStorage.getItem('token') || ''; // Replace '' with your default token if needed
  
  const config = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
    },
  };

  useEffect(() => {
    fetchData(); // Load data when the component mounts
  }, []);

  const fetchData = () => {
    axios.get<Dropoffarea[]>(url, config)
      .then((response) => {
        setDropoffareasData(response.data.dropoffarea);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleSearch = async (e) => {
    e.preventDefault(); 
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/dropoffarea/search";
      const token = localStorage.getItem('token') || '';

      const data = new URLSearchParams();
      data.append("search", search);
  
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
  
      const response = await axios.post(url, data, config);
      setDropoffareasData(response.data.result);
      setSearch('');
    } catch (error) {
      toast.error(`${search} does not exist`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });   
      setLoading(false); 
    }
  };

  const handleEdit = (dropoffareaId: number ) => {
    // setLoading(true);
    try {

    const formdata = new FormData();
    formdata.append("name", formData.name);

    const url = `https://madad.onrender.com/api/admin/dropoffarea/update/${dropoffareaId}`;
    axios
    .put(url, formdata, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(function (response) {
        toast.success('Dropoffarea updated successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        // setLoading(false);
        closePopup(dropoffareaId);

      // fetch the dropoffareas data table again
      fetchData();
       
    
        setDropoffareasData((prevDropoffareas) => [...prevDropoffareas, response.data.dropoffarea]);


        setSelectedDropoffarea(null); // Close the options menu
      })
    } catch (error) {
      toast.error("Add the dropoffarea Image, try again!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });
      // setLoading(false);
    } 
  };

  const handleDelete = (dropoffareaId: number) => {
    // Handle delete action
    const config = {
      method: 'delete',
      url: `https://madad.onrender.com/api/admin/configuration/delete-dropoffarea/${dropoffareaId}`,
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };
    
    axios(config)
      .then(function (response) {
        toast.success('Dropoffarea deleted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000, // Adjust the duration as needed
        });

        fetchData(); // fetch the dropoffareas data table again 
        // setDropoffareasData((prevDropoffareas) => [...prevDropoffareas, response.data.dropoffarea]);

        // setDropoffareasData((prevDropoffareas) => prevDropoffareas.filter((dropoffarea) => dropoffarea._id !== dropoffareaId));
        // setSelectedDropoffarea(null); 
      })
      .catch(function (error) {
        toast.error('Could not delete dropoffarea, try again', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000,
        });      
      });
  };

  const toggleOptions = (dropoffarea: Dropoffarea) => {
    if (selectedDropoffarea === dropoffarea) {
      setSelectedDropoffarea(null);
    } else {
      setSelectedDropoffarea(dropoffarea);
    }
  };

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleSort = (option: string) => {
    let sortedData = [...dropoffareasData];
    if (option === 'ascending') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'descending') {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === 'date') {
      sortedData.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    setDropoffareasData(sortedData);
    setSortOption(option);
    setSortDropdownVisible(false);
  };

  const handleFilter = (option: string) => {
    let filteredData = [...dropoffareasData];
    // map over the dropoffareasData and filter using the names of the dropoffareas
    if (option !== '') {
    filteredData = filteredData.filter((dropoffarea) => dropoffarea.name === option);
    } else {
      fetchData();
    }

    setDropoffareasData(filteredData);
    setFilterOption(option);
    setFilterDropdownVisible(false);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
       <div className="flex flex-row justify-between">
      <h4 className="text-title-sm mb-4 font-semibold text-black dark:text-white">
        Dropoff Details
     </h4>
      </div>
      <div className="flex flex-col flex-start">
        <table className="">
          <thead>
            <tr className="border-b border-stroke dark:bg-meta-4">
              {/* Header cells */}
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Dropoff Area</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Dropoff Landmark</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Table body */}
            {dropoffareasData.map((dropoffarea, index) => (
              <tr key={dropoffarea?._id || ''} className={`border-b border-stroke dark:border-strokedark ${index === 0 ? 'rounded-t-sm' : ''}`}>           
                <td className="p-2.5 xl:p-5">{dropoffarea?.dropoffarea || ''}</td>
                <td className="p-2.5 xl:p-5">
                  {dropoffarea?.dropofflandmark.length > 1 ? (
                    <div className="flex flex-col gap-1">
                      {dropoffarea.dropofflandmark.map((dropofflandmark) => (
                        <span>
                          {dropofflandmark.dropofflandmark},
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {dropoffarea?.dropofflandmark.map((dropofflandmark) => (
                        <span>
                          {dropofflandmark.dropofflandmark}
                        </span>
                      )) || ''}
                    </div>
                  ) || ''
                    
                  }
                </td>                
                
                <td className="p-2.5 xl:p-5">
                  {/* <div className="flex flex-row gap-4"> */}
                  {/* <button 
                        onClick={() => togglePopup(dropoffarea._id)}                      
                        className="rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90">
                      Edit
                    </button>
                    {popupOpenMap[dropoffarea._id] && (
                            <div
                              ref={popup}
                              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                            >
                              <div
                                  className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                                  style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                                >              
                                    <div className="flex flex-row justify-between">
                                    <h2 className="text-xl font-semibold mb-4">Edit Dropoffarea</h2>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => closePopup(dropoffarea._id)}
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
                                        <div className="w-full">
                                          <label className="mb-3 block text-black dark:text-white">
                                              Dropoffarea Name
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
                                      </div>
                                    
                                  
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(dropoffarea._id)} 
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
                                              <>Update Dropoffarea</>
                                            )}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                            </div>
                          )} */}

                  

                    <button
                      onClick={() => showDeleteConfirmation(dropoffarea._id)}
                      className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                    {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete this dropoffarea?</p>
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={hideDeleteConfirmation}
                              className="mr-4 rounded bg-primary py-2 px-3 text-white hover-bg-opacity-90"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                hideDeleteConfirmation();
                                handleDelete(dropoffareaToDeleteId);
                              }}
                              className="rounded bg-danger py-2 px-3 text-white hover-bg-opacity-90"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* </div> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DropoffTable;
