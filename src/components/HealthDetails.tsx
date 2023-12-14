import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
const HealthDetails = () => {

  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);

  const [usersDetails, setUsersDetails] = useState<User[]>([]);
  const [recipientDid, setRecipientDid] = useState("");
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false);
  const [popupOpenMap, setPopupOpenMap] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState<{ name: string; dateOfBirth: string; maritalStatus: string; identificationNumber: string; height: string; weight: string; bloodGroup: string; genotype: string;  allergies: string; treatments: string; medicalCare: string; diagnosis: string; medications: string; familyHistory: string; complaints: string; illnessHistory: string; signs: string; phyExamination: string; surgicalHistory: string; obstetricHistory: string; medicalAllergies: string; immunizationHistory: string; habits: string;}>({
    name: '',
    dateOfBirth: '',
    maritalStatus: '',
    identificationNumber: '',
    height: '',
    weight: '',
    bloodGroup: '',
    genotype: '',
    allergies: '',
    treatments: '',
    medicalCare: '',
    diagnosis: '',
    medications: '',
    familyHistory: '',
    complaints: '',
    illnessHistory: '',
    signs: '',
    phyExamination: '',
    surgicalHistory: '',
    obstetricHistory: '',
    medicalAllergies: '',
    immunizationHistory: '',
    habits: '',
  }); 

  const [showDetails, setShowDetails] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null); 
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {

    const initWeb5 = async () => {
      // @ts-ignore
      const { Web5 } = await import('@web5/api/browser');
      
      try {
        const { web5, did } = await Web5.connect({ 
          sync: '5s', 
        });
        setWeb5(web5);
        setMyDid(did);
        console.log(web5);
      } catch (error) {
        console.error('Error initializing Web5:', error);
      }
    };

    initWeb5();
    
}, []);
  


  const toggleDetails = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  };

  const togglePopup = (userId: string) => {
    usersDetails.map((user) => { 
      if (user.recordId === userId) {
        setFormData({
          name: user.name,
          dateOfBirth: user.dateOfBirth,
          maritalStatus: user.maritalStatus,
          identificationNumber: user.identificationNumber,
          height: user.height,
          weight: user.weight,
          bloodGroup: user.bloodGroup,
          genotype: user.genotype,
          allergies: user.allergies,
          treatments: user.treatments,
          medicalCare: user.medicalCare,
          diagnosis: user.diagnosis,
          medications: user.medications,
          familyHistory: user.familyHistory,
          complaints: user.complaints,
          illnessHistory: user.illnessHistory,
          signs: user.signs,
          phyExamination: user.phyExamination,
          surgicalHistory: user.surgicalHistory,
          obstetricHistory: user.obstetricHistory,
          medicalAllergies: user.medicalAllergies,
          immunizationHistory: user.immunizationHistory,
          habits: user.habits,
        });
      }
    });
    setPopupOpenMap((prevMap) => ({
      ...prevMap,
      [userId]: !prevMap[userId],
    }));
  };
  
const closePopup = (userId: string) => {
  setPopupOpenMap((prevMap) => ({
    ...prevMap,
    [userId]: false,
  }));
};

const fetchHealthDetails = async () => {
  setFetchDetailsLoading(true);
  try {
    const response = await web5.dwn.records.query({
      from: myDid,
      message: {
        filter: {
            protocol: 'https://did-box.com',
            protocolPath: 'healthDetails',
            // schema: 'https://did-box.com/schemas/healthDetails',
        },
      },
    });
    console.log('Health Details:', response);

    if (response.status.code === 200) {
      const healthDetails = await Promise.all(
        response.records.map(async (record) => {
          const data = await record.data.json();
          console.log(data);
          return {
            ...data,
            recordId: record.id,
          };
        })
      );
      setUsersDetails(healthDetails);
      console.log(healthDetails);
      toast.success('Successfully fetched health details', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
      setFetchDetailsLoading(false);
    } else {
      console.error('No health details found');
      toast.error('Failed to fetch health details', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    }
    setFetchDetailsLoading(false);
  } catch (err) {
    console.error('Error in fetchHealthDetails:', err);
    toast.error('Error in fetchHealthDetails. Please try again later.', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
    });
    setFetchDetailsLoading(false);
  };
};


const shareHealthDetails = async (recordId: string) => {
  setShareLoading(true);
  try {
    const response = await web5.dwn.records.query({
      message: {
        filter: {
          recordId: recordId,
        },
      },
    });

    if (response.records && response.records.length > 0) {
      const record = response.records[0];
      const { status } = await record.send(recipientDid);
      console.log('Send record status in shareProfile', status);
      toast.success('Successfully shared health record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
      setShareLoading(false);
      setSharePopupOpen(false);
    } else {
      console.error('No record found with the specified ID');
      toast.error('Failed to share health record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      });
    }
    setShareLoading(false);
  } catch (err) {
    console.error('Error in shareProfile:', err);
    toast.error('Error in shareProfile. Please try again later.', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
    });
    setShareLoading(false);
  }
};

const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  //  if (name === 'name' || name === 'nationality' ) {
  //   // Use a regular expression to allow only letters and spaces
  //   const letterRegex = /^[A-Za-z\s]+$/;
  //   if (!value.match(letterRegex) && value !== '') {
  //     // If the input value doesn't match the regex and it's not an empty string, do not update the state
  //     return;
  //   }
  // }

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));

  const file = e.target.files?.[0];

  if (file) {
    setSelectedFileName(file.name);
  } 
};

const showDeleteConfirmation = (userId: string) => {
    setUserToDeleteId(userId);
    setDeleteConfirmationVisible(true);
  };

  const hideDeleteConfirmation = () => {
    setUserToDeleteId(null);
    setDeleteConfirmationVisible(false);
  };

  const updateHealthDetails = async (recordId, data) => {
    setUpdateLoading(true);
  try {
    const response = await web5.dwn.records.query({
      message: {
        filter: {
          recordId: recordId,
        },
      },
    });

    if (response.records && response.records.length > 0) {
      const record = response.records[0];
      const updateResult = await record.update({data: data});
      togglePopup(recordId)
      if (updateResult.status.code === 202) {
        toast.success('Health Details updated successfully.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUsersDetails(prevHealthDetails => prevHealthDetails.map(message => message.recordId === recordId ? { ...message, ...data } : message));
        setUpdateLoading(false);
      } else {
        console.error('Error updating message:', updateResult.status);
        toast.error('Error updating campaign', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUpdateLoading(false);
      }
    } else {
      console.error('No record found with the specified ID');
      toast.error('No record found with the specified ID', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
    }
  } catch (error) {
    console.error('Error in updateHealthDetail:', error);
    toast.error('Error in updateHealthDetail:', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000, 
    });
    setUpdateLoading(false);
  }
};


const deleteHealthDetails = async (recordId) => {
  try {
    const response = await web5.dwn.records.query({
      message: {
        filter: {
          recordId: recordId,
        },
      },
    });
    console.log(response);
    if (response.records && response.records.length > 0) {
      const record = response.records[0];
      console.log(record)
      const deleteResult = await web5.dwn.records.delete({
        message: {
          recordId: recordId
        },
      });

      const remoteResponse = await web5.dwn.records.delete({
        from: myDid,
        message: {
          recordId: recordId,
        },
      });
      console.log(remoteResponse);
      
      if (deleteResult.status.code === 202) {
        console.log('Health Details deleted successfully');
        toast.success('Health Details deleted successfully', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUsersDetails(prevHealthDetails => prevHealthDetails.filter(message => message.recordId !== recordId));
      } else {
        console.error('Error deleting record:', deleteResult.status);
        toast.error('Error deleting record:', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
      }
    } else {
      // console.error('No record found with the specified ID');
    }
  } catch (error) {
    console.error('Error in deleteHealthDetails:', error);
  }
};

  

  return (
    <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
     <div className="flex flex-row mb-5 items-center gap-4 justify-end">
      <button 
        onClick={fetchHealthDetails}
        className=" items-center  rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90">
        {fetchDetailsLoading ? (
          <div className="flex items-center">
            <div className="spinner"></div>
            <span className="pl-1">Fetching...</span>
          </div>
        ) : (
          <>Fetch Profile</>
        )}           
      </button>
      <div className="relative">
        <button
          onClick={toggleDetails}
          className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
    </div>
    {usersDetails.length > 0 ? (
      <div className="flex flex-row flex-wrap justify-evenly gap-2">
      {usersDetails.map((user, index) => (
      <div className="flex flex-wrap w-full" key={index}>
        <div className='w-full mb-5 font-medium text-black text-xl'>Identification Information</div>
        <div className='w-1/3 mb-5' >
          <span className="text-xl">Name</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.name : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Date of Birth</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.dateOfBirth : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Marital Status</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.maritalStatus : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Identification Number</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.identificationNumber : '********'}
          </h4>
        </div>

        <div className='w-full mb-5 font-medium text-black text-xl'>Physical Details</div>
        <div className='w-1/3 mb-5' >
          <span className="text-xl">Height</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.height : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Weight</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.weight : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Blood Group</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.bloodGroup : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Genotype</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.genotype : '********'}
          </h4>
        </div>

        <div className='w-full mb-5 font-medium text-black text-xl'>Medical History</div>
        <div className='w-1/3 mb-5' >
          <span className="text-xl">Allergies</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.allergies : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Treatments</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.treatments : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Medical Care</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.medicalCare : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Diagnosis</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.diagnosis : '********'}
          </h4>
        </div>

        <div className='w-full mb-5 font-medium text-black text-xl'>Medication Information</div>
        <div className='w-1/3 mb-5' >
          <span className="text-xl">Medications</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.medications : '********'}
          </h4>
        </div>

        <div className='w-full mb-5 font-medium text-black text-xl'>Family History</div>
        <div className='w-1/3 mb-5' >
          <span className="text-xl">Any Family History?</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.familyHistory : '********'}
          </h4>
        </div>

        <div className='w-full mb-5 font-medium text-black text-xl'>Treatments History</div>
        <div className='w-1/3 mb-5' >
          <span className="text-xl">Complaints</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.complaints : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Illness History</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.illnessHistory : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Signs</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.signs : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Physical Examination</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.phyExamination : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Surgical History</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.surgicalHistory : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Obstetric History</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.obstetricHistory : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Medical Allergies</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.medicalAllergies : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Immunization History</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.immunizationHistory : '********'}
          </h4>
        </div>

        <div className='w-1/3 mb-5' >
          <span className="text-xl">Habits</span>
          <h4 className="text-xl mt-1 font-medium text-black dark:text-white">
            {showDetails ? user.habits : '********'}
          </h4>
        </div>

        <div className='w-full flex flex-row justify-evenly mb-5'>
          <div className="relative">
            <button
              ref={trigger}
              onClick={() => setSharePopupOpen(!sharePopupOpen)}
              className="inline-flex items-center justify-center rounded-full bg-success py-3 px-7 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
            >
              Share
            </button>
            {sharePopupOpen && (
                <div
                  ref={popup}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                >
                  <div
                      className="lg:mt-15 lg:w-1/2 rounded-lg bg-white dark:bg-dark pt-3 px-4 shadow-md"
                      style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                    >      
                    <div
                      className="w-full wow fadeInUp mb-12 rounded-lg bg-primary/[5%] py-11 px-8 dark:bg-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
                      data-wow-delay=".15s
                      ">        
                        <div className="flex flex-row justify-between ">
                          <h2 className="text-xl font-semibold mb-4">Share Health Details</h2>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setSharePopupOpen(false)}
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
                    <div className="-mx-4 flex flex-wrap">
                      <div className="w-full px-4">
                        <div className="mb-8">
                          <label
                            htmlFor="recipientDid"
                            className="mb-3 block text-sm font-medium text-dark dark:text-white"
                          >
                            Recipient DID
                          </label>
                          <div>
                          <input
                            type="text"
                            name="recipientDid"
                            value={recipientDid}
                            onChange={(e) => setRecipientDid(e.target.value)}
                            placeholder="Paste Recipient DID"
                            required
                            className="w-full rounded-lg border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
                          />
                          </div>
                        </div>
                      </div>
                      
                      
                      <div className="w-full px-4">
                        <button 
                          type="button"
                          onClick={() => shareHealthDetails(user.recordId)}
                          disabled={shareLoading}
                          className="rounded-lg bg-primary py-4 px-9 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp">
                          {shareLoading ? (
                            <div className="flex items-center">
                              <div className="spinner"></div>
                              <span className="pl-1">Sharing...</span>
                            </div>
                          ) : (
                            <>Share</>
                          )}
                        </button>
                      </div>
                    </div>
                      </form>
                      </div>
                    </div>
                </div>
              )}
          </div>

          <div className="relative">
            <button
              onClick={() => togglePopup(user.recordId)}                      
              className="inline-flex items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
              >
              Edit
            </button>
              {popupOpenMap[user.recordId] && (
                    <div
                      ref={popup}
                      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                    >
                      <div
                          className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                          style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                        >              
                            <div className="flex flex-row justify-between">
                            <h2 className="text-xl font-semibold mb-4">Edit User Details</h2>
                            <div className="flex justify-end">
                              <button
                                onClick={() => closePopup(user.recordId)}
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
                      <h3 className="mb-2.5 block font-semibold dark:text-white">Identification Information</h3>
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Name
                        </label>
                        <div className={`relative ${formData.name ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Date of Birth
                        </label>
                        <div className={`relative ${formData.dateOfBirth ? 'bg-light-blue' : ''}`}>
                        <input
                           type="date" 
                          name="dateOfBirth"
                          required
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Marital Status
                        </label>
                        <div className={`relative ${formData.maritalStatus ? 'bg-light-blue' : ''}`}>
                        <select
                              name="maritalStatus"
                              value={formData.maritalStatus}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select Status</option>                        
                              <option value="Married">Married</option>
                              <option value="Single">Single</option>
                            </select>                        
                          </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                                           
                      <div className="w-full xl:w-2/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Idenetification Number
                        </label>
                        <div className={`relative ${formData.identificationNumber ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="identificationNumber"
                          value={formData.identificationNumber}
                          required
                          onChange={handleInputChange}
                          placeholder="SSN123456"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <h3 className="mb-2.5 mt-10 block font-semibold dark:text-white">Physical Details</h3>
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Height (cm)
                        </label>
                        <div className={`relative ${formData.height ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="height"
                          required
                          value={formData.height}
                          onChange={handleInputChange}
                          placeholder="165"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Weight (kg)
                        </label>
                        <div className={`relative ${formData.weight ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="weight"
                          required
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="75"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Blood Group
                        </label>
                        <div className={`relative ${formData.bloodGroup ? 'bg-light-blue' : ''}`}>
                        <select
                              name="bloodGroup"
                              value={formData.bloodGroup}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select Group</option>                        
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="O+">O+</option>
                            </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-2/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Genotype
                        </label>
                        <div className={`relative ${formData.genotype ? 'bg-light-blue' : ''}`}>
                        <select
                              name="genotype"
                              value={formData.genotype}
                              onChange={handleInputChange}
                              required
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary">
                              <option value="">Select Genotype</option>                        
                              <option value="AA">AA</option>
                              <option value="AS">AS</option>
                              <option value="SS">SS</option>
                              <option value="AC">AC</option>
                            </select>
                        </div>
                      </div>
                    </div>

                    <h3 className="mb-2.5 block mt-10 font-semibold dark:text-white">Medical History</h3>
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Allergies
                        </label>
                        <div className={`relative ${formData.allergies ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="allergies"
                          required
                          value={formData.allergies}
                          onChange={handleInputChange}
                          placeholder="Heat Rash"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Treatments
                        </label>
                        <div className={`relative ${formData.treatments ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="treatments"
                          required
                          value={formData.treatments}
                          onChange={handleInputChange}
                          placeholder="Enter treatments undergone"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Medical Care
                        </label>
                        <div className={`relative ${formData.medicalCare ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="medicalCare"
                          required
                          value={formData.medicalCare}
                          onChange={handleInputChange}
                          placeholder="Previous Medical Care"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                    <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Diagnosis
                        </label>
                        <div className={`relative ${formData.diagnosis ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text" 
                          name="diagnosis"
                          required
                          placeholder='Enter Diagnosis'
                          value={formData.diagnosis}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 
                    </div>

                    <h3 className="mb-2.5 block mt-10 font-semibold dark:text-white">Medication Information</h3>
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-full">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Medicines Taken
                        </label>
                        <div className={`relative ${formData.medications ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="medications"
                          required
                          value={formData.medications}
                          onChange={handleInputChange}
                          placeholder="Antibiotics Celecoxib"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>     
                    </div>

                    <h3 className="mb-2.5 block mt-10 font-semibold dark:text-white">Family History</h3>
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-full">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Any Family Health History?
                        </label>
                        <div className={`relative ${formData.familyHistory ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="familyHistory"
                          required
                          value={formData.familyHistory}
                          onChange={handleInputChange}
                          placeholder="Engineering Journal"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                    </div>

                    <h3 className="mb-2.5 block mt-10 font-semibold dark:text-white">Treatment History</h3>
                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Chief Complaints
                        </label>
                        <div className={`relative ${formData.complaints ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="complaints"
                          required
                          value={formData.complaints}
                          onChange={handleInputChange}
                          placeholder="Cough"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          History of Illness
                        </label>
                        <div className={`relative ${formData.illnessHistory ? 'bg-light-blue' : ''}`}>
                        <input
                           type="text" 
                          name="illnessHistory"
                          required
                          placeholder='Enter Illness History'
                          value={formData.illnessHistory}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Vital Signs
                        </label>
                        <div className={`relative ${formData.signs ? 'bg-light-blue' : ''}`}>
                        <input
                            type='text'
                            name="signs"
                            value={formData.signs}
                            onChange={handleInputChange}
                            required
                            placeholder='Enter Vital Signs'
                            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                           </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Physical Examination
                        </label>
                        <div className={`relative ${formData.phyExamination ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="phyExamination"
                          required
                          value={formData.phyExamination}
                          onChange={handleInputChange}
                          placeholder="Enter Physical Examination Details"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>
                
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Surgical History
                        </label>
                        <div className={`relative ${formData.surgicalHistory ? 'bg-light-blue' : ''}`}>
                        <input
                           type="text" 
                          name="surgicalHistory"
                          required
                          placeholder='Enter Surgical History'
                          value={formData.surgicalHistory}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Obstetric History
                        </label>
                        <div className={`relative ${formData.obstetricHistory ? 'bg-light-blue' : ''}`}>
                        <input
                              name="obstetricHistory"
                              value={formData.obstetricHistory}
                              onChange={handleInputChange}
                              required
                              placeholder='Enter Obstetric History'
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>                      
                          </div>
                      </div>
                    </div>

                    <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Medical Allergies
                        </label>
                        <div className={`relative ${formData.medicalAllergies ? 'bg-light-blue' : ''}`}>
                        <input
                          type="text"
                          name="medicalAllergies"
                          required
                          value={formData.medicalAllergies}
                          onChange={handleInputChange}
                          placeholder="Heat Rash"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Immunization History
                        </label>
                        <div className={`relative ${formData.immunizationHistory ? 'bg-light-blue' : ''}`}>
                        <input
                           type="text" 
                          name="immunizationHistory"
                          required
                          placeholder='Polio'
                          value={formData.immunizationHistory}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div> 

                      <div className="w-full xl:w-3/5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Habits
                        </label>
                        <div className={`relative ${formData.habits ? 'bg-light-blue' : ''}`}>
                        <input
                          name="habits"
                          value={formData.habits}
                          onChange={handleInputChange}
                          required
                          placeholder='Smoking'
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>                         
                          </div>
                      </div>
                    </div>
       
                    <h3 className="mb-2.5 block mt-10 font-semibold dark:text-white">Lab Results</h3>
                    {/* <div className="mb-4.5 flex flex-col gap-3">
                      <label className="mb-2.5 block text-black dark:text-white">
                      Image
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
                    </div>           */}
                  </div>
                          </form>
                        <button
                          type="button"
                          onClick={() => updateHealthDetails(user.recordId, formData)}
                          disabled={updateLoading}
                          className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updateLoading ? (
                            <div className="flex items-center">
                              <div className="spinner"></div>
                              <span className="pl-1">Updating...</span>
                            </div>
                          ) : (
                            <>Update Details</>
                          )}
                        </button>
                        </div>
                    </div>
                  )}
          </div>

          <div className="relative">
            <button
              onClick={() => showDeleteConfirmation(user.recordId)}
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
                        deleteHealthDetails(user.recordId);
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
      ))}
      </div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <div className="text-md font-medium text-gray-500 dark:text-gray-400">
            No Details yet
          </div>
        </div>
      )}
    </div>

  );
};

export default HealthDetails;
