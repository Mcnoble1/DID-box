import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

interface Complaint {
  _id: number;
  worker: string;
  description: string;
  user: string;
  title: string;
  createdAt: string;
  
}

const ComplaintsTable: React.FC = () => {
  const [complaintsData, setComplaintsData] = useState<Complaint[]>([]);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [sortOption, setSortOption] = useState<string>(''); 
  const [filterOption, setFilterOption] = useState<string>(''); 
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [feedbackToDeleteId, setFeedbackToDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  let filterOptions = ['Good Review', 'Bad Review', 'Suggestion', 'Wrong Information', 'Feature Request', 'App Crash Report', 'Others'];

  const showDeleteConfirmation = (feedbackId: number) => {
    setFeedbackToDeleteId(feedbackId);
    setDeleteConfirmationVisible(true);
  };

  
  const hideDeleteConfirmation = () => {
    setFeedbackToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };
  
  const handleSearch = async (e) => {
    e.preventDefault(); 
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/feedback/search";
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
      setComplaintsData(response.data.result);
      setSearch('');
    } catch (error) {
      toast.error(`${search} does not exist`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000, // Adjust the duration as needed
      });   
      setLoading(false); 
    }
  };

  const url = "https://madad.onrender.com/api/admin/feedback/get";
  const token = localStorage.getItem('token') || ''; // Replace '' with your default token if needed
  
  const config = {
    method: 'get',
    headers: {
      'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
    },
  };

  const formatDatetime = (datetimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(datetimeString).toLocaleDateString(undefined, options);
    return formattedDate;
  };

  useEffect(() => {
    fetchData();
    }, []);

    const fetchData = async () => {
      axios.get<Complaint[]>(url, config)
      .then((response) => {
        setComplaintsData(response.data.feedback);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleDelete = (feedbackId: number) => {
    // Handle delete action
    const config = {
      method: 'delete',
      url: `https://madad.onrender.com/api/admin/feedback/delete/${feedbackId}`,
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };
    
    axios(config)
      .then(function (response) {
        toast.success('Feedback deleted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });

        setComplaintsData((prevComplaints) => [...prevComplaints, response.data.feedback]);

        setComplaintsData((prevComplaints) => prevComplaints.filter((feedback) => feedback._id !== feedbackId));
        setSelectedFeedback(null); 
      })
      .catch(function (error) {
        // toast.error('Could not delete feedback, try again', {
        //   position: toast.POSITION.TOP_RIGHT,
        //   autoClose: 3000,
        // });      
      });
  };


  const handleSort = (option: string) => {
    let sortedData = [...complaintsData];
    if (option === 'ascending') {
      sortedData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'descending') {
      sortedData.sort((a, b) => b.title.localeCompare(a.title));
    } else if (option === 'date') {
      sortedData.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
  
    setSortOption(option);
    setSortDropdownVisible(false); // Close the dropdown
    setComplaintsData(sortedData);
  };

  const handleFilter = (option: string) => {
    let filteredData = [];
    filterOptions.map((filterOption) => {
      if (option === filterOption) {
        filteredData = complaintsData.filter((complaint) => complaint.title === filterOption);
      } else if (option === '') {
        fetchData();
      }
    });
    
    setFilterOption(option);
    setFilterDropdownVisible(false); // Close the dropdown
    setComplaintsData(filteredData);
  };


  const exportToExcel = () => {
    const tableData = [
      ['Type of Complaint', 'Complaint', 'Issuer', 'Date of Complaint'],
      ...complaintsData.map((complaint) => [
        complaint.title,
        complaint.description,
        complaint.user?.name || '',
        formatDatetime(complaint.createdAt),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FeedbacksTable');
    XLSX.writeFile(wb, 'feedbacks_table.xlsx');
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
    <div className="flex flex-row justify-between">
      <h4 className="text-title-sm mb-4 font-semibold text-black dark:text-white">
        Feedbacks / Complaints
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
                placeholder="Search Feedbacks..."
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
                {filterOptions.map((filterOpt) => (
                  <li
                    onClick={() => handleFilter(filterOpt)}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === filterOpt ? 'bg-primary text-white' : ''
                    }`}
                  >
                    {filterOpt}
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
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Type of Complaint</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Complaint</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Issuer</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Date of Complaint</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Table body */}
            {complaintsData.map((complaint, index) => (
              <tr key={complaint._id} className={`border-b border-stroke dark:border-strokedark ${index === 0 ? 'rounded-t-sm' : ''}`}>
                <td className="p-2.5  xl:p-5">{complaint.title}</td>
                <td className="p-2.5  xl:p-5">{complaint.description}</td>
                <td className="p-2.5  xl:p-5">{complaint.user?.name}</td>
                <td className="p-2.5  xl:p-5">{formatDatetime(complaint.createdAt)}</td>
                <td className="p-2.5 xl:p-5 ">
                  <div className="flex flex-row gap-4">
                 
                    <button
                      onClick={() => showDeleteConfirmation(complaint._id)}
                      className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                    {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete this feedback?</p>
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
                                handleDelete(feedbackToDeleteId);
                              }}
                              className="rounded bg-danger py-2 px-3 text-white hover-bg-opacity-90"
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
                  className="mr-5 mb-5 mt-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                >
                  Export to Excel
                </button>
    </div>
  );
};

export default ComplaintsTable;






