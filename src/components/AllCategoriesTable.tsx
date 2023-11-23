import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import axios from 'axios'; // You may need to install axios
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

interface Category {
  _id: number;
  image: string;
  name: string;
  service: Array<string>;
  createdAt: string;
  updatedAt: string;
}

const CategoriesTable: React.FC = () => {
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<number | null>(null);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>(''); 
  const [filterOption, setFilterOption] = useState<string>(''); 
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ name: string; image: File | null }>({
    name: '',
    image: null,
  });

  const popup = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showDeleteConfirmation = (categoryId: number) => {
    setCategoryToDeleteId(categoryId);
    setDeleteConfirmationVisible(true);
  };

  
  const hideDeleteConfirmation = () => {
    setCategoryToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };
  
  const togglePopup = (categoryId: number) => {
    categoriesData.map((category) => { 
      if (category._id === categoryId) {
        setFormData({
          name: category.name,
          image: null,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [categoryId]: !prevMap[categoryId],
    }));
  };

  // Function to close the popup for a specific category
  const closePopup = (categoryId: number) => {
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [categoryId]: false,
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


  const url = "https://madad.onrender.com/api/admin/category/get";
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
    fetchData(); // Load data when the component mounts
  }, []);

  const fetchData = () => {
    axios.get<Category[]>(url, config)
      .then((response) => {
        setCategoriesData(response.data.category);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleSearch = async (e) => {
    e.preventDefault(); 
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/category/search";
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
      setCategoriesData(response.data.result);
      setSearch('');
    } catch (error) {
      toast.error(`${search} does not exist`, {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });   
      setLoading(false); 
    }
  };

  const handleEdit = (categoryId: number ) => {
    // setLoading(true);
    try {

    const formdata = new FormData();
    formdata.append("name", formData.name);
    formdata.append("image", fileInputRef.current.files[0], fileInputRef.current?.files[0].name);

    const url = `https://madad.onrender.com/api/admin/category/update/${categoryId}`;
    axios
    .put(url, formdata, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(function (response) {
        toast.success('Category updated successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, // Adjust the duration as needed
        });
        // setLoading(false);
        closePopup(categoryId);

      // fetch the categorys data table again
      fetchData();
       
    
        setCategoriesData((prevCategories) => [...prevCategories, response.data.category]);


        setSelectedCategory(null); // Close the options menu
      })
    } catch (error) {
      toast.error("Add the category Image, try again!", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, // Adjust the duration as needed
      });
      // setLoading(false);
    } 
  };

  const handleDelete = (categoryId: number) => {
    // Handle delete action
    const config = {
      method: 'delete',
      url: `https://madad.onrender.com/api/admin/category/delete/${categoryId}`,
      headers: {
        'Authorization': `Bearer ${token}`, // Include the bearer token in the Authorization header
      },
    };
    
    axios(config)
      .then(function (response) {
        toast.success('Category deleted successfully!', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000, // Adjust the duration as needed
        });

        setCategoriesData((prevCategories) => [...prevCategories, response.data.category]);

        setCategoriesData((prevCategories) => prevCategories.filter((category) => category._id !== categoryId));
        setSelectedCategory(null); 
      })
      .catch(function (error) {
        toast.error('Could not delete category, try again', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000,
        });      
      });
  };

  const toggleOptions = (category: Category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
  };

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const handleSort = (option: string) => {
    let sortedData = [...categoriesData];
    if (option === 'ascending') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'descending') {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === 'date') {
      sortedData.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    setCategoriesData(sortedData);
    setSortOption(option);
    setSortDropdownVisible(false);
  };

  const handleFilter = (option: string) => {
    let filteredData = [...categoriesData];
    // map over the categoriesData and filter using the names of the categories
    if (option !== '') {
    filteredData = filteredData.filter((category) => category.name === option);
    } else {
      fetchData();
    }

    setCategoriesData(filteredData);
    setFilterOption(option);
    setFilterDropdownVisible(false);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
       <div className="flex flex-row justify-between">
      <h4 className="text-title-sm mb-4 font-semibold text-black dark:text-white">
        Categories
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
                placeholder="Search Categories..."
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
                {/* map over the categoriesData and list the category names as dropdown options */}
                {categoriesData.map((category) => (
                  <li
                    key={category._id}
                    onClick={() => handleFilter(category.name)}
                    className={`cursor-pointer px-4 py-2 ${
                      filterOption === category.name ? 'bg-primary text-white' : ''
                    }`}
                  >
                    {category.name}
                  </li>
                ))}
                {/* add more options here */}
                  {/* clear filter */}
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
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Categories Image</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Category Name</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Subcategories</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Created On</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Last Modified On</th>
              <th className="p-2.5 xl:p-5 text-sm font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Table body */}
            {categoriesData.map((category, index) => (
              <tr key={category._id} className={`border-b border-stroke dark:border-strokedark ${index === 0 ? 'rounded-t-sm' : ''}`}>
                <td className="p-2.5 xl:p-5">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 ">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-12 w-12 rounded-full" // Add a class to control the image size
                      />
                    </div>
                  </div>
                </td>                
                <td className="p-2.5 xl:p-5 ">{category.name}</td>
                <td className="p-2.5 xl:p-5 ">
                  {category.service.length > 1 ? (
                    <div className="flex flex-col gap-1">
                      {category.service.map((service) => (
                        <span>
                          {service.name},
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {category.service.map((service) => (
                        <span>
                          {service.name}
                        </span>
                      ))}
                    </div>
                  )
                    
                  }
                </td>                
                <td className="p-2.5 xl:p-5 ">{formatDatetime(category.createdAt)}</td>
                <td className="p-2.5 xl:p-5 ">{formatDatetime(category.updatedAt)}</td>
                <td className="p-2.5 xl:p-5 ">
                  <div className="flex flex-row gap-4">
                  <button 
                        onClick={() => togglePopup(category._id)}                      
                        className="rounded bg-primary py-2 px-3 text-white hover:bg-opacity-90">
                      Edit
                    </button>
                    {popupOpenMap[category._id] && (
                            <div
                              ref={popup}
                              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                            >
                              <div
                                  className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                                  style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                                >              
                                    <div className="flex flex-row justify-between">
                                    <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => closePopup(category._id)}
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
                                      </div>
                                      <div className="mb-4.5 flex flex-col gap-3">           
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

                                  
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(category._id)} 
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
                                              <>Update Category</>
                                            )}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                            </div>
                          )}

                  

                    <button
                      onClick={() => showDeleteConfirmation(category._id)}
                      className="rounded bg-danger py-2 px-3 text-white hover:bg-opacity-90"
                    >
                      Delete
                    </button>
                    {isDeleteConfirmationVisible && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                        <div className="bg-white p-5 rounded-lg shadow-md">
                          <p>Are you sure you want to delete this category?</p>
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
                                handleDelete(categoryToDeleteId);
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
    </div>
  );
};

export default CategoriesTable;
