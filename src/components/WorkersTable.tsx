import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import Select from 'react-select';
import '../pages/signin.css';

interface Worker {
  _id: number;
  name: string;
  image: string;
  number: number;
  gender: string;
  block: string;
  phone: string;
  whatsapp: string;
  area: string;
  nationality: string;
  dateofbirth: string;
  languages: string[];
  lengthOfService: string;
  category: string;
  service: string[];
  familyInKuwait: string;
  petFriendly: string;
  address: string;
}

const WorkersTable: React.FC = () => {
  const [workersData, setWorkersData] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [workerToDeleteId, setWorkerToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]); // State to store categories
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [nationalityDropdown, setNationalityDropdown] = useState(false);
  const [sortOption, setSortOption] = useState<string>(''); 
  const [search, setSearch] = useState('');
  const [filterOption, setFilterOption] = useState<string>(''); 
  
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ name: string; dateofbirth: string; gender: string; phone: string; whatsapp: string; area: string; block: string; address: string; nationality: string; category: string; service:string[]; languages: string[]; lengthOfService: string; familyInKuwait: string; petFriendly: string; image: File | null }>({
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
    category: '',
    dateofbirth: '',
    lengthOfService: '',
    familyInKuwait: '',
    petFriendly: '',
    image: null,
  });

  const [nations, setNations] = useState<string[]>([]);

  const [selectedServices, setSelectedServices] = useState<any[]>([]);

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

  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const togglePopup = (workerId: number) => {
    workersData.map((worker) => { 
      if (worker._id === workerId) {
        setFormData({
         name: worker.name,
         gender: worker.gender,
          phone: worker.phone,
          whatsapp: worker.whatsapp,
          area: worker.area,
          block: worker.block,
          address: worker.address,
          nationality: worker.nationality,
          dateofbirth: worker.dateofbirth,
          languages: worker.languages,
          service: worker.service,
          category: worker.category,
          lengthOfService: worker.lengthOfService,
          familyInKuwait: worker.familyInKuwait,
          petFriendly: worker.petFriendly,
          image: null,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [workerId]: !prevMap[workerId],
    }));
  };

  const formatDate = (datetimeString: any) => {
    // express in this format yyyy-mm-dd
    const formattedDate = new Date(datetimeString).toISOString().split('T')[0];
    return formattedDate;
  };


  useEffect(() => {
    // Fetch categories when the component mounts
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
  
    fetchCategories();
  }, []);
  
  // const formatDatetime = (datetimeString: any) => {
  //   const options = { year: 'numeric', month: 'long', day: 'numeric' };
  //   const formattedDate = new Date(datetimeString).toLocaleDateString(undefined, options);
  //   return formattedDate;
  // };

  const formatAge = (datetimeString: any) => {
    const age = new Date().getFullYear() - new Date(datetimeString).getFullYear();
    return age;
  };

  // Function to close the popup for a specific worker
  const closePopup = (workerId: number) => {
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [workerId]: false,
    }));
  };

   const handleSearch = async (e) => {
    e.preventDefault(); 
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/worker/search";
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
      setWorkersData(response.data.result);
      setSearch('');
    } catch (error) {
      toast.error(`${search} does not exist`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });   
    }
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

  const showDeleteConfirmation = (workerId: number) => {
    setWorkerToDeleteId(workerId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setWorkerToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };


  const url = "https://madad.onrender.com/api/admin/worker/get";
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
    axios.get<Worker[]>(url, config)
      .then((response) => {
        setWorkersData(response.data.workers);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        // toast.error("Couldn't fetch workers, try again!", {
        //   position: toast.POSITION.TOP_RIGHT,
        //   autoClose: 3000, 
        // });
      });
  };

  const handleEdit = (workerId: number ) => {
   
      // Validate the form fields
  const requiredFields = ['name', 'gender', 'phone', 'category', 'nationality', 'languages', 'service', 'dateofbirth', 'whatsapp', 'address', 'area', 'block', 'lengthOfService', 'familyInKuwait', 'petFriendly'];
  const emptyFields = requiredFields.filter((field) => !formData[field]);

  if (emptyFields.length > 0) {
    toast.error('Please fill all required fields.', {
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


    try {

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
    formdata.append('whatsapp', formData.whatsapp);
    formdata.append('address', formData.address);
    formdata.append('area', formData.area);
    formdata.append('block', formData.block);
    formdata.append('dateofbirth', formData.dateofbirth);
    formdata.append('lengthOfService', formData.lengthOfService);
    formdata.append('familyInKuwait', formData.familyInKuwait);
    formdata.append('petFriendly', formData.petFriendly);
    formdata.append("image", fileInputRef.current.files[0], fileInputRef.current.files[0]?.name);

    setLoading(true);

    const url = `https://madad.onrender.com/api/admin/worker/update/${workerId}`;
    axios
    .put(url, formdata, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(function (response) {
        setLoading(false);
        toast.success('Worker updated successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        closePopup(workerId);
      fetchData();
      window.location.reload();
      })
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      toast.error("Add the worker Image, Category and service", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });
    } 
};


  const handleDelete = (workerId: number) => {
    const config = {
      method: 'delete',
      url: `https://madad.onrender.com/api/admin/worker/delete/${workerId}`,
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };
    
    axios(config)
      .then(function (response) {
        toast.success('Worker deleted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });

        fetchData();
      })
      .catch(function (error) {
        toast.error("Couldn't delete worker, try again!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000, // Adjust the duration as needed
        });
      });
  };

  const toggleNationalityDropdown = () => {
    const nationsArray: string[] = [];
    workersData.forEach((worker) => {
      if (!nationsArray.includes(worker.nationality)) {
        nationsArray.push(worker.nationality);
    }});
    setNations(nationsArray);
    setNationalityDropdown(!nationalityDropdown);
  }; 

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleSort = (option: string) => {
    let sortedData = [...workersData];
    if (option === 'ascending') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'descending') {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === 'date') {
      sortedData.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    setWorkersData(sortedData);
    setSortOption(option);
    setSortDropdownVisible(false); // Close the dropdown
  };

  const handleFilter = (option: string) => {
    let filteredData = [...workersData];
      
    if (option === 'Male' || option === 'Female') {
      filteredData = workersData.filter((worker) => worker.gender === option);
    } else if (option === option) {
      filteredData = workersData.filter((worker) => worker.nationality === option);
    } else if (option === 'Full Time' || option === 'Part Time') {
      filteredData = workersData.filter((worker) => worker.lengthOfService === option);
    } else if (option === 'FYes') {
      filteredData = workersData.filter((worker) => worker.familyInKuwait === 'Yes');
    } else if (option === 'FNo') {
      filteredData = workersData.filter((worker) => worker.familyInKuwait === 'No');
    } else if (option === 'PYes') {
      filteredData = workersData.filter((worker) => worker.petFriendly === 'Yes');
    }
    else if (option === 'PNo') {
      filteredData = workersData.filter((worker) => worker.petFriendly === 'No');
    }

    if (option === '') {
      fetchData();
    }
  
    setWorkersData(filteredData);
    setFilterOption(option);
    setFilterDropdownVisible(false); // Close the dropdown
  };
  
  const exportToExcel = () => {
    const tableData = [
      [
        'Name', 'Gender', 'Year of Birth', 'Age', 'Nationality', 'Phone Number', 'Languages', 'Length of Service',
        'Main Category', 'Type of Service', 'Family in Kuwait', 'Petfriendly', 'Home Address'
      ],
      ...workersData.map((worker) => [
        worker.name,
        worker.gender,
        worker.dateofbirth,
        formatAge(worker.dateofbirth),
        worker.nationality,
        worker.phone,
        worker.languages.map(e => e).join(', '),
        worker.lengthOfService,
        worker.category?.name || '',
        worker.service.map(e => e.name).join(', '),
        worker.familyInKuwait,
        worker.petFriendly,
        worker.address,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WorkersTable');
    XLSX.writeFile(wb, 'workers_table.xlsx');
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-row justify-between">
      <h4 className="text-title-sm mb-4 font-semibold text-black dark:text-white">
        Workers
     </h4>
     <div className="hidden sm:block flex flex-row justify-center">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <button className="absolute top-1/2 left-0 -translate-y-1/2">
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Search Workers..."
                className="w-full bg-transparent pr-4 pl-9 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>
      <div className="flex gap-2">
        <div className="relative">
          <button
            onClick={toggleFilterDropdown}
            className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
          >
            Filter
          </button>
          {filterDropdownVisible && (
              <div className="absolute flex flex-row top-12 left-0 bg-white border border-stroke rounded-b-sm shadow-lg dark:bg-boxdark">
                <ul className="py-2">
                <li
                    onClick={toggleNationalityDropdown }
                    className={`cursor-pointer px-4 py-2`}
                  >
                    Nationality
                    {nationalityDropdown && (
                      <div className="absolute w-full left-0 bg-white border border-stroke rounded-b-sm shadow-lg dark:bg-boxdark">
                        <ul>
                          {nations.map((nation) => (
                          <li onClick={() => {
                            handleFilter(nation);
                            }}
                          className={`cursor-pointer px-4 py-2 ${
                            filterOption === nation ? 'bg-primary text-white' : ''
                          }`}>
                            {nation}</li>
                            ))}
                        </ul>          
                      </div>
                        )}
                    
                  </li>
                  <li
                    onClick={() => handleFilter('Male')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'Male' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Gender (Male)
                  </li>
                  <li
                    onClick={() => handleFilter('Female')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'Female' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Gender (Female)
                  </li>
                 
                  <li
                    onClick={() => handleFilter('PYes')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'PYes' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Petfriendly (Yes)
                  </li>
                  <li
                    onClick={() => handleFilter('PNo')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'PNo' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Petfriendly (No)
                  </li>
                   <li
                    onClick={() => handleFilter('FYes')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'FYes' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Family in Kuwait (Yes)
                  </li>
                  <li
                    onClick={() => handleFilter('FNo')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'FNo' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Family in Kuwait (No)
                  </li>
                  <li
                    onClick={() => handleFilter('Full Time')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'Full Time' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Length of Service (Full Time)
                  </li>
                  <li
                    onClick={() => handleFilter('Part Time')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === 'Part Time' ? 'bg-primary text-white' : ''
                    }`}
                  >
                    Length of Service (Part Time)
                  </li>
                  <li
                    onClick={() => handleFilter('')}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === '' ? 'bg-primary text-white' : ''
                    }`}
                >
                  Clear Filter
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={toggleSortDropdown}
            className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Sort
          </button>
          {sortDropdownVisible && (
            <div className="absolute top-12 left-0 bg-white border border-stroke rounded-b-sm shadow-lg dark:bg-boxdark">
              <ul className="py-2">
                <li
                  onClick={() => handleSort('ascending')}
                  className={`cursor-pointer px-4 py-2 ${
                    sortOption === 'ascending' ? 'bg-primary text-white' : ''
                  }`}
                >
                  Ascending Order
                </li>
                <li
                  onClick={() => handleSort('descending')}
                  className={`cursor-pointer px-4 py-2 ${
                    sortOption === 'descending' ? 'bg-primary text-white' : ''
                  }`}
                >
                  Descending Order
                </li>
                <li
                  onClick={() => handleSort('date')}
                  className={`cursor-pointer px-4 py-2 ${
                    sortOption === 'date' ? 'bg-primary text-white' : ''
                  }`}
                >
                  Date
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      </div>
      <div className="flex flex-col overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stroke dark:bg-meta-4">
              {/* Header cells */}
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Image</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Name</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Gender</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Year of Birth</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Age</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Nationality</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Phone Number</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Languages</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Length of Service</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Main Category</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Type of Service</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Family in Kuwait</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Petfriendly</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Home Address</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Table body */}
            {workersData.map((worker, index) => (
              <tr key={worker._id} className={`border-b border-stroke dark:border-strokedark ${index === 0 ? 'rounded-t-sm' : ''}`}>
                <td className="p-2.5 xl:p-5 ">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={worker.image}
                        alt={worker.name}
                        className="h-12 w-12 rounded-full" // Add a class to control the image size
                      />
                    </div>
                  </div>
                </td>
                <td className="p-2.5 xl:p-5 ">{worker.name}</td>
                <td className="p-2.5 xl:p-5 ">{worker.gender}</td>
                <td className="p-2.5 xl:p-5 ">{worker.dateofbirth}</td>
                <td className="p-2.5 xl:p-5 ">{formatAge(worker.dateofbirth)}</td>
                <td className="p-2.5 xl:p-5 ">{worker.nationality}</td>
                <td className="p-2.5 xl:p-5 ">{worker.phone}</td>
                <td className="p-2.5 xl:p-5 ">
                  { worker.languages.length > 1 ? (
                    <span>{worker.languages.join(', ')}</span>
                  ) : (
                    <span>{worker.languages}</span>
                  )}
                </td>                
                <td className="p-2.5 xl:p-5 ">{worker.lengthOfService}</td>
                <td className="p-2.5 xl:p-5 ">{worker.category?.name || ''}</td>
                {/* display the sevices in the service array */}
                <td className="p-2.5 xl:p-5 ">
                  {worker.service.map((service) => (
                    <span key={service._id}>
                      {service.name},{' '}
                    </span>
                  ))}
                </td>
                <td className="p-2.5 xl:p-5 ">{worker.familyInKuwait}</td>
                <td className="p-2.5 xl:p-5 ">{worker.petFriendly}</td>
                <td className="p-2.5 xl:p-5 ">{worker.address}</td>
                <td className="p-2.5 xl:p-5">
                  <div className="flex flex-row gap-4">
                  <button 
                      onClick={() => togglePopup(worker._id)}                      
                      className="rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90">
                      Edit
                    </button>
                    {popupOpenMap[worker._id] && (
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
                                            <div className={`relative ${formData.languages.length ? 'bg-light-blue' : ''}`}>
                                            <Select
                                              isMulti
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
                                                { label: 'Chinese', value: 'Chinese' },
                                                { label: 'Spanish', value: 'Spanish' },
                                                { label: 'Hindi', value: 'Hindi' },
                                                { label: 'Portuguese', value: 'Portuguese' },
                                                { label: 'Russian', value: 'Russian' },
                                                { label: 'Japanese', value: 'Japanese' },
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
                                              <div className={`relative ${formData.category ? 'bg-light-blue' : ''}`}>
                                    
                                                {/* <Select
                                                    value={{label: formData.category.name, value: formData.category._id}}
                                                    onChange={(selectedOption) => {
                                                      const selectedCategory = categories.find((category) => category._id === selectedOption.value);
                                                      setSelectedCategory(selectedCategory);
                                                      setFormData((prevData) => ({
                                                        ...prevData,
                                                        category: selectedCategory,
                                                        service: [],
                                                      }));
                                                    }}
                                                    options={categories.map((category) => ({
                                                      label: category.name,
                                                      value: category._id,
                                                    }))}
                                                    placeholder="Select Category"
                                                  /> */}
                                                   <select
                                                    name="category"
                                                    value={selectedCategory?._id || ''}
                                                    onChange={handleInputChange}
                                                    required
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
                                          <div className="w-full xl:w-1/2">
                                            <label className="mb-2.5 block text-black dark:text-white">
                                              Service
                                            </label>
                                            <div className={`relative ${formData.service ? 'bg-light-blue' : ''}`}>
                                              <Select
                                                    // isMulti
                                                    // value={{label: formData.service[0]?.name || '', value: formData.service[0]?._id || ''}}
                                                    // onChange={(selectedOptions) => {
                                                    //   const selectedServices = selectedOptions.map((option) => option.name);
                                                    //   setFormData((prevData) => ({
                                                    //     ...prevData,
                                                    //     service: selectedServices,            
                                                    //   }));
                                                    // }}
                                                    // options={selectedCategory? selectedCategory.service.map((service) => ({ 
                                                    //   label: service.name, 
                                                    //   value: service._id 
                                                    // })) : []}
                                                    // placeholder="Select service(s)"
                                                    isMulti
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
                    <button
                      onClick={() => showDeleteConfirmation(worker._id)}
                      className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                    {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete this worker?</p>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={exportToExcel}
        className="mr-5 mb-5 mt-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
      >
        Export to Excel
      </button>
    </div>
  );
};

export default WorkersTable;
