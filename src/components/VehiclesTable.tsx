import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import axios from 'axios'; // You may need to install axios
import * as XLSX from 'xlsx';
import Select from 'react-select';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

interface Vehicle {
  _id: number;
  image: string;
  company: string;
  driver: string;
  phone: string;
  vehicle: string;
  whatsapp: string;
  pickuparea: string[];
  pickupblock: string[];
  dropofflandmark: string[];
  dropoffarea: string[];
  area: string;
  block: string;
  building: string;
}

const VehiclesTable: React.FC = () => {
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [vehicleToDeleteId, setVehicleToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState<string>(''); 
  const [filterOption, setFilterOption] = useState<string>(''); 
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ driver: string; phone: string; company: string; whatsapp: string; vehicle: string; pickuparea: string[]; pickupblock: string[]; area: string; dropoffarea: string[]; dropofflandmark: string[]; block: string; building: string; image: File | null }>({
    driver: '',
    phone: '',
    company: '',
    whatsapp: '',
    vehicle: '',
    pickuparea: [],
    pickupblock: [],
    dropofflandmark: [],
    dropoffarea: [],
    area: '',
    block: '',
    building: '',
    image: null,
  });

  const [dropoffareas, setDropoffareas] = useState<Dropoffarea[]>([]); // Array to store dropoffareas
  const [selectedDropoffarea, setSelectedDropoffarea] = useState<Dropoffarea | null>(null);
  const [selectedLandmarks, setSelectedLandmarks] = useState<any[]>([]);

  const [pickupInstances, setPickupInstances] = useState<
  Array<{ area: string; block: string }>
>([
  { area: '', block: '' },
]);

const [dropoffInstances, setDropoffInstances] = useState<
  Array<{ area: string; landmark: string[] }>
>([{ area: '', landmark: [] }]);

const addPickupAreaBlockInstance = () => {
  setPickupInstances([...pickupInstances, { area: '', block: '' }]);
};

const addDropoffAreaLandmarkInstance = () => {
  setDropoffInstances([...dropoffInstances, { area: '', landmark: [] }]);
};

  const [pickupAreasData, setPickupAreasData] = useState<{ [key: string]: number }>({
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
    "Others": 0, 
  });

  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const togglePopup = (vehicleId: number) => {
    vehiclesData.map((vehicle) => { 
      if (vehicle._id === vehicleId) {
        setFormData({
          driver: vehicle.driver,
          phone: vehicle.phone,
          company: vehicle.company,
          whatsapp: vehicle.whatsapp,
          vehicle: vehicle.vehicle,
          pickuparea: vehicle.pickuparea,
          pickupblock: vehicle.pickupblock,
          dropofflandmark: vehicle.dropofflandmark,
          dropoffarea: vehicle.dropoffarea,
          area: vehicle.area,
          block: vehicle.block,
          building: vehicle.building,
          image: null,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [vehicleId]: !prevMap[vehicleId],
    }));
  };

  // Function to close the popup for a specific vehicle
  const closePopup = (vehicleId: number) => {
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [vehicleId]: false,
    }));
  };

  useEffect(() => {
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
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    fetchDropoffareas();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault(); 
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/transportation/search";
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
      setVehiclesData(response.data.result);
      setSearch('');
    } catch (error) {
      toast.error(`${search} does not exist`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });   
      setLoading(false); 
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone' || name === 'whatsapp') {
      // Use a regular expression to allow only phone numbers starting with a plus
      const phoneRegex = /^[+]?[0-9\b]+$/;
        
      if (!value.match(phoneRegex) && value !== '') {
        // If the input value doesn't match the regex and it's not an empty string, do not update the state
        return;
      }
    } else if (name === 'driver' || name === 'company' || name === 'area' || name === 'vehicle' || name === 'pickuparea' || name === 'dropoffarea' || name === 'dropofflandmark') {
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

  const showDeleteConfirmation = (vehicleId: number) => {
    setVehicleToDeleteId(vehicleId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setVehicleToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };

  const url = "https://madad.onrender.com/api/admin/transportation/get";
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
    axios.get<Vehicle[]>(url, config)
    .then((response) => {
      setVehiclesData(response.data.transportation);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      // toast.error("Couldn't fetch vehicles, try again!", {
      //   position: toast.POSITION.TOP_RIGHT,
      //   autoClose: 3000, 
      // });
    });
  };

   const handleLandmarkChange = (selectedOptions: any, instanceIndex: number) => {
    setSelectedLandmarks(selectedOptions);
    setDropoffInstances((prevInstances) =>
      prevInstances.map((instance, index) =>
        index === instanceIndex
          ? { ...instance, landmark: selectedOptions.map((option: any) => option.value) }
          : instance
      )
    );
  };

  const handleEdit = (vehicleId: number ) => {
    setLoading(true);
    try {

    const formdata = new FormData();
    formdata.append("driver", formData.driver);
    formdata.append("phone", formData.phone);
    formdata.append("company", formData.company);
    formdata.append("whatsapp", formData.whatsapp);
    formdata.append("vehicle", formData.vehicle);
    for (let i = 0; i < pickupInstances.length; i++) {
      formdata.append("pickuparea[]", pickupInstances[i].area);
    };
    for (let i = 0; i < pickupInstances.length; i++) {
      formdata.append("pickupblock[]", pickupInstances[i].block);
    };
    for (let i = 0; i < dropoffInstances.length; i++) {
      formdata.append('dropoffarea[]', dropoffInstances[i].area);
      formdata.append('dropofflandmark[]', dropoffInstances[i].landmark);
    }
    formdata.append("area", formData.area);
    formdata.append("block", formData.block);
    formdata.append("building", formData.building);
    formdata.append("image", fileInputRef.current.files[0], fileInputRef.current?.files[0].name);

    const url = `https://madad.onrender.com/api/admin/transportation/update/${vehicleId}`;
    axios
    .put(url, formdata, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(function (response) {
        toast.success('Vehicle updated successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        // setLoading(false);
        closePopup(vehicleId);

      // fetch the vehicles data table again
      fetchData();
       
    
        setVehiclesData((prevVehicles) => [...prevVehicles, response.data.transportation]);


        setSelectedVehicle(null); // Close the options menu
      })
    } catch (error) {
      toast.error("Add the vehicle Image, try again!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });
    } 
  };

  const handleDelete = (vehicleId: number) => {
   
    // Handle delete action
    const config = {
      method: 'delete',
      url: `https://madad.onrender.com/api/admin/transportation/delete/${vehicleId}`,
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };
    
    axios(config)
      .then(function (response) {
        toast.success('Vehicle deleted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });

        setVehiclesData((prevVehicles) => [...prevVehicles, response.data.transportation]);

        setVehiclesData((prevVehicles) => prevVehicles.filter((vehicle) => vehicle._id !== vehicleId));
        setSelectedVehicle(null); // Close the options menu
      })
      .catch(function (error) {
        toast.error("Couldn't delete vehicle, try again!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000, // Adjust the duration as needed
        });
      });
  };

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleSort = (option: string) => {
    let sortedData = [...vehiclesData];
    if (option === 'ascending') {
      sortedData.sort((a, b) => a.company.localeCompare(b.company));
    } else if (option === 'descending') {
      sortedData.sort((a, b) => b.company.localeCompare(a.company));
    } else if (option === 'date') {
      sortedData.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
  
    setSortOption(option);
    setSortDropdownVisible(false); // Close the dropdown
    setVehiclesData(sortedData);
  };

  const handleFilter = (option: string) => {
    let filteredData = [];
    if (option !== '') {
      filteredData = vehiclesData.filter((vehicle) => vehicle.company === option);
    } else {
      fetchData();
    }

    setVehiclesData(filteredData);
    setFilterOption(option);
    setFilterDropdownVisible(false); // Close the dropdown
  };


  const exportToExcel = () => {
    const tableData = [
      ['Company Name', 'Driver', 'Phone Number', 'Vehicle Type'],
      ...vehiclesData.map((vehicle) => [
        vehicle.company,
        vehicle.driver,
        vehicle.phone,
        vehicle.vehicle,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VehiclesTable');
    XLSX.writeFile(wb, 'vehicles_table.xlsx');
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-row justify-between">
      <h4 className="text-title-sm mb-4 font-semibold text-black dark:text-white">
        Vehicles
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
                placeholder="Search Transportation..."
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

        <div className="relative">
          <button
            onClick={toggleFilterDropdown}
            className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
          >
            Filter
          </button>
          {filterDropdownVisible && (
            <div className="absolute top-12 left-0 bg-white border border-stroke rounded-b-sm shadow-lg dark:bg-boxdark">
              <ul className="py-2">
                {vehiclesData.map((vehicle) => (
                  <li
                    key={vehicle._id}
                    onClick={() => handleFilter(vehicle.company)}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === vehicle.company ? 'bg-primary text-white' : ''
                    }`}
                  >
                    {vehicle.company}
                  </li>
                ))
                }
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
      </div>
      </div>
      <div className="flex flex-col overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stroke dark:bg-meta-4">
              {/* Header cells */}
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Image</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Company Name</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Driver</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Phone Number</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Vehicle Type</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Table body */}
            {vehiclesData.map((vehicle, index) => (
              <tr key={vehicle._id} className={`border-b border-stroke dark:border-strokedark ${index === 0 ? 'rounded-t-sm' : ''}`}>
                <td className="p-2.5 xl:p-5 ">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <img src={vehicle.image} alt={vehicle.company} className="h-12 w-12 mr-5 rounded-full"/>
                    </div>
                  </div>
                </td>
                <td className="p-2.5 xl:p-5 ">{vehicle.company}</td>
                <td className="p-2.5 xl:p-5 ">{vehicle.driver}</td>
                <td className="p-2.5 xl:p-5 ">{vehicle.phone}</td>
                <td className="p-2.5 xl:p-5 ">{vehicle.vehicle}</td>
                <td className="p-2.5 xl:p-5">
                  <div className="flex flex-row gap-4">
                  <button
                        onClick={() => togglePopup(vehicle._id)}                      
                        className="rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90">
                        Edit
                    </button>

                    {popupOpenMap[vehicle._id] && (
                            <div
                              ref={popup}
                              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                            >
                              <div
                                  className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                                  style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                                >              
                                    <div className="flex flex-row justify-between">
                                    <h2 className="text-xl font-semibold mb-4">Edit Vehicle</h2>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => closePopup(vehicle._id)}
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
                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Name of the Driver
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Alan Smith"
                                            name="driver"
                                            value={formData.driver}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>

                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Phone Number
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="+234807653421"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>
                                      </div>

                                      <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Name of the Company
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Max Transport"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>

                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Whatsapp No
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="+1234567890"
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>
                                      </div>
                                    
                                    

                                      <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                <div className="w-full xl:w-1/2">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Area
                                  </label>
                                  <div className={`relative ${formData.area ? 'bg-light-blue' : ''}`}>
                                      <select
                                          name="area"
                                          value={formData.area}
                                          onChange={handleInputChange}
                                          required
                                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                                        >
                                          <option value="">Select Area</option>
                                          {Object.keys(pickupAreasData).map((area) => (
                                        <option key={area} value={area}>
                                          {area}
                                        </option>
                                      ))}
                                        </select>
                                  </div>
                                </div>

                                <div className="w-full xl:w-1/2">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                    Block
                                  </label>
                                  <div className={`relative ${formData.block ? 'bg-light-blue' : ''}`}>
                                    <select
                                          name="block"
                                          value={formData.block}
                                          onChange={handleInputChange}
                                          required
                                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                                        >
                                          <option value="">Select Block</option>
                                          {formData.area && [...Array(pickupAreasData[formData.area]).keys()].map((block) => (
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
                                            Building
                                          </label>
                                          <input
                                            type="number"
                                            placeholder="4"
                                            required
                                            name="building"
                                            value={formData.building}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>

                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Type of the Vehicle
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Toyota Hilux"
                                            name="vehicle"
                                            value={formData.vehicle}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>
                                      </div>

                                      <div className="mb-4.5">
                {pickupInstances.map((instance, index) => (
                  <div key={index} className="flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-3/7">
                      <label className="mb-2.5 block text-black dark:text-white">
                        { index === 0 ? 'Pickup Area' : `Pickup Area ${index + 1}`}
                      </label>
                      <div className={`relative ${instance.area ? 'bg-light-blue' : ''}`}>
                        <select
                          name={`pickuparea-${index}`}
                          value={instance.area}
                          onChange={(e) => {
                            const updatedInstances = [...pickupInstances];
                            updatedInstances[index].area = e.target.value;
                            setPickupInstances(updatedInstances);
                          }}
                          required
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                        >
                          <option value="">Select Pickup Area</option>
                          {Object.keys(pickupAreasData).map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="w-full xl:w-3/7 mb-5">
                      <label className="mb-2.5 block text-black dark:text-white">
                      { index === 0 ? 'Pickup Block' : `Pickup Block ${index + 1}`}
                      </label>
                      <div className={`relative ${instance.block ? 'bg-light-blue' : ''}`}>
                        <select
                          name={`pickupblock-${index}`}
                          value={instance.block}
                          onChange={(e) => {
                            const updatedInstances = [...pickupInstances];
                            updatedInstances[index].block = e.target.value;
                            setPickupInstances(updatedInstances);
                          }}
                          required
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                        >
                          <option value="">Select Pickup Block</option>
                          {instance.area &&
                            [...Array(pickupAreasData[instance.area]).keys()].map((block) => (
                              <option key={block} value={block + 1}>
                                {block + 1}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end xl:w-1/7">
                    <button
                      type="button"
                      onClick={addPickupAreaBlockInstance}
                      className="text-blue-500 hover:text-gray-700 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 fill-current bg-primary rounded-full p-1 hover:bg-opacity-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="white"
                      >
                        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                  </div>
                  </div>
                ))}             
              </div>             

                  <div className="mb-4.5">
                      {dropoffInstances.map((instance, index) => (
                        <div key={index} className="flex flex-col gap-6 xl:flex-row">
                        <div className="w-full xl:w-3/7">
                          <label className="mb-2.5 block text-black dark:text-white">
                            {index === 0 ? 'Dropoff Area' : `Dropoff Area ${index + 1}`}
                          </label>
                          <div className={`relative ${instance.area ? 'bg-light-blue' : ''}`}>
                            <select
                              name={`dropoffarea-${index}`}
                              value={instance.area}
                              onChange={(e) => {
                                const updatedInstances = [...dropoffInstances];
                                updatedInstances[index].area = e.target.value;
                                setDropoffInstances(updatedInstances);
                                const { value } = e.target;
                                const selectedDropoffareaObject = dropoffareas.find((dropoffarea) => dropoffarea.dropoffarea === value);
  
                                setSelectedDropoffarea(selectedDropoffareaObject || null);
                              }}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"
                            >
                              <option value="">Select Dropoff Area</option>
                              {dropoffareas.map((dropoffarea) => (
                                <option key={dropoffarea._id} value={dropoffarea.dropoffarea}>
                                  {dropoffarea.dropoffarea}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="w-full xl:w-3/7 mb-5">
                          <label className="mb-2.5 block text-black dark:text-white">
                            Dropoff Landmark
                            </label>
                          <div className={`relative ${instance.landmark ? 'bg-light-blue' : ''}`}>
                            <Select
                                  isMulti
                                  name={`dropofflandmark-${index}`}
                                  value={instance.landmark.label}
                                  onChange={(selectedOptions) => handleLandmarkChange(selectedOptions, index)}
                                  options={selectedDropoffarea?.dropofflandmark.map((dropofflandmark) => ({
                                    value: dropofflandmark.dropofflandmark,
                                    label: dropofflandmark.dropofflandmark,
                                  }))}
                                  placeholder="Select landmark(s)"  

                                />
                              </div>
                        </div>

                        <div className="flex justify-end xl:w-1/7">
                          <button
                            type="button"
                            onClick={addDropoffAreaLandmarkInstance}
                            className="text-blue-500 hover:text-gray-700 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 fill-current bg-primary rounded-full p-1 hover:bg-opacity-90"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="white" 
                            >
                              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      ))}
                    </div>
                                  
                                      <div className="mb-4.5 flex flex-col gap-3">           
                                          <label className="mb-2.5 block text-black dark:text-white">
                                              Vehicle Image
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

                                  
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(vehicle._id)} 
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
                                              <>Update Vehicle</>
                                            )}
                                      </button>
                              
                                  </form>
                                </div>
                            </div>
                          )}

                    <button
                      onClick={() => showDeleteConfirmation(vehicle._id)}
                      className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                    {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete this vehicle?</p>
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
                                handleDelete(vehicleToDeleteId);
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
                 // Close popup on second page
                  className="mr-5 mt-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                >
                  Export to Excel
                </button>
    </div>
  );
};

export default VehiclesTable;
