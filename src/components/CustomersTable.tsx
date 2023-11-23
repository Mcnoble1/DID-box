import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios'; 
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

interface Customer {
  _id: number;
  name: string;
  phone: string;
  dateofbirth: string;
  nationality: string;
  languages: string;
  block: string;
  area: string;
}

const CustomersTable: React.FC = () => {
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [sortOption, setSortOption] = useState<string>(''); 
  const [filterOption, setFilterOption] = useState<string>(''); 
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ name: string; phone: string; dateofbirth: string; nationality: string; languages: string; block: string; area: string; }>({
    name: '',
    phone: '',
    dateofbirth: '',
    nationality: '',
    languages: '',
    block: '',
    area: '',
  });
  const [nations, setNations] = useState<string[]>([]);

  const popup = useRef<HTMLDivElement | null>(null);

  const togglePopup = (customerId: number) => {
    customersData.map((customer) => {
      if (customer._id === customerId) {
        setFormData({
          name: customer.name,
          phone: customer.phone,
          dateofbirth: customer.dateofbirth,
          nationality:  customer.nationality,
          languages: customer.languages,
          block: customer.block,
          area: customer.area,
      });
      }
    });
    setPopupOpenMap((prev) => ({ 
      ...prev, 
      [customerId]: !prev[customerId], 
    }));
  };

  

  const closePopup = (customerId: number) => {
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [customerId]: false,
    }));
  };

  const formatDatetime = (datetimeString: any) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(datetimeString).toLocaleDateString(undefined, options);
    return formattedDate;
  };

  const handleSearch = async (e) => {
    e.preventDefault(); 
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/customer/search";
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
      setCustomersData(response.data.result);
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const showDeleteConfirmation = (vehicleId: number) => {
    setCustomerToDeleteId(vehicleId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setCustomerToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };

  const url = "https://madad.onrender.com/api/admin/customer/get";
  const token = localStorage.getItem('token') || ''; // Replace '' with your default token if needed
  
  const config = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
    },
  };

  useEffect(() => {
    fetchData();
  }
, []);

    const fetchData = () => {
    axios.get<Customer[]>(url, config)
    .then((response) => {
      setCustomersData(response.data.customers);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
    }

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
  };

  const toggleFilterDropdown = () => {
    const nationsArray: string[] = [];
  customersData.forEach((customer) => {
    if (!nationsArray.includes(customer.nationality)) {
      nationsArray.push(customer.nationality);
  }});
  setNations(nationsArray);
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleEdit = (customerId: number) => {
    setLoading(true);
    const url = `https://madad.onrender.com/api/admin/customer/update/${customerId}`;
    const token = localStorage.getItem('token') || ''; // Replace '' with your default token if needed
    const config = {
      method: 'put',
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
      data: formData,
    };

    axios(url, config)
      .then((response) => {
        toast.success('Customer updated successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        setCustomersData((prevData) => {
          const newCustomersData = prevData.map((customer) => {
            if (customer._id === customerId) {
              return {
                ...customer,
                ...formData,
              };
            }
            return customer;
          });
          return newCustomersData;
        });
        setLoading(false);
        closePopup(customerId);
      })
      .catch((error) => {
        console.error('Error updating data:', error);
        setLoading(false);
      });
  }

  const handleDelete = (customerId: number) => {
    setLoading(true);
    const url = `https://madad.onrender.com/api/admin/customer/delete/${customerId}`;
    const token = localStorage.getItem('token') || ''; // Replace '' with your default token if needed
    const config = {
      method: 'delete',
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };

    axios(url, config)
      .then((response) => {
        toast.success('Customer deleted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        setCustomersData((prevData) => {
          const newCustomersData = prevData.filter((customer) => customer._id !== customerId);
          return newCustomersData;
        });
        setLoading(false);
        hideDeleteConfirmation();
      })
      .catch((error) => {
        console.error('Error deleting data:', error);
        toast.error('Error deleting customer!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        setLoading(false);
      });
  };

  const handleSort = (option: string) => {
    let sortedData = [...customersData];
    if (option === 'ascending') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'descending') {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === 'date') {
      sortedData.sort((a, b) => a.id - b.id);
    }
    setCustomersData(sortedData);
    setSortOption(option);
    setSortDropdownVisible(false);
  };

  const handleFilter = (option: string) => {
    let filteredData = [...customersData];
    if (option !== '') {
      filteredData = customersData.filter((customer) => customer.nationality === option);
    } else {
      fetchData();
    }

    setCustomersData(filteredData);
    setFilterOption(option);
    setFilterDropdownVisible(false); // Close the dropdown
  };


  const exportToExcel = () => {
    const tableData = [
      ['Name', 'Phone Number', 'Nationality', 'Year of Birth', 'Languages', 'Block', 'Area'],
      ...customersData.map((customer) => [
        customer.name,
        customer.phone,
        customer.nationality,
        customer.dateofbirth,
        customer.languages,
        customer.block,
        customer.area,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CustomersTable');
    XLSX.writeFile(wb, 'customers_table.xlsx');
  };
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-row justify-between">
      <h4 className="text-title-sm mb-4 font-semibold text-black dark:text-white">
        Customers
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
                placeholder="Search Customers..."
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
                {nations.map((nation) => (
                  <li
                    onClick={() => handleFilter(nation)}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === nation ? 'bg-primary text-white' : ''
                    }`}
                  >
                    {nation}
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
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Customers</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Phone Number</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Nationality</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Date of Birth</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Languages</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Block</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Area</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Table body */}
            {customersData.map((customer, index) => (
              <tr key={customer._id} className={`border-b border-stroke dark:border-strokedark ${index === 0 ? 'rounded-t-sm' : ''}`}>
                <td className="p-2.5 xl:p-5 ">{customer.name}</td>
                <td className="p-2.5 xl:p-5 ">{customer.phone}</td>
                <td className="p-2.5 xl:p-5 ">{customer.nationality}</td>
                <td className="p-2.5 xl:p-5 ">{formatDatetime(customer.dateofbirth)}</td>
                <td className="p-2.5 xl:p-5 ">
                  {customer.languages.map((language) => (
                    <span key={language}>
                      {language},{' '}
                    </span>
                  ))}
                </td>
                {/* <td className="p-2.5 xl:p-5 ">{customer.service}</td> */}
                <td className="p-2.5 xl:p-5 ">{customer.block}</td>
                <td className="p-2.5 xl:p-5 ">{customer.area}</td>
                <td className="p-2.5 xl:p-5">
                  <div className="flex flex-row gap-4">
                  <button
                        onClick={() => togglePopup(customer._id)}                      
                        className="rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90">
                        Edit
                    </button>

                    {popupOpenMap[customer._id] && (
                            <div
                              ref={popup}
                              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                            >
                              <div
                                  className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                                  style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                                >              
                                    <div className="flex flex-row justify-between">
                                    <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => closePopup(customer._id)}
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
                                            Name
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Alan Smith"
                                            name="driver"
                                            value={formData.name}
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
                                            languages
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="English"
                                            name="languages"
                                            value={formData.languages}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>

                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Nationality
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Kuwaiti"
                                            name="nationality"
                                            value={formData.nationality}
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
                                          <input
                                            type="text"
                                            placeholder="New Jersey"
                                            required
                                            name="area"
                                            value={formData.area}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>

                                        <div className="w-full xl:w-1/2">
                                          <label className="mb-2.5 block text-black dark:text-white">
                                            Block
                                          </label>
                                          <input
                                            type="text"
                                            placeholder="Block 1"
                                            name="block"
                                            value={formData.block}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                          />
                                        </div>
                                      </div>

                                      <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                        <div className="w-full xl:w-1/2">
                                        <label className="mb-2.5 block text-black dark:text-white">
                                          Year of Birth
                                        </label>
                                        <div className={`relative ${formData.dateofbirth ? 'bg-light-blue' : ''}`}>
                                        <input
                                          type="text" 
                                          maxLength={4}
                                          
                                          placeholder='YYYY'
                                          name="dateofbirth"
                                          required
                                          value={formData.dateofbirth}
                                          onChange={handleInputChange}
                                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                                        </div>
                                        </div>
                                      </div>                            
                                  </div>

                                  
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(customer._id)} 
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
                                              <>Update Customer</>
                                            )}
                                      </button>
                              
                                  </form>
                                </div>
                            </div>
                          )}

                    <button
                      onClick={() => showDeleteConfirmation(customer._id)}
                      className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                    {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete this customer?</p>
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
                                handleDelete(customerToDeleteId);
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

export default CustomersTable;
