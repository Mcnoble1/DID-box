import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import Select from 'react-select';
import Image from '../images/user/7.png';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../pages/signin.css';
const LetterCard = () => {
  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);

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
      } catch (error) {
        console.error('Error initializing Web5:', error);
      }
    };

    initWeb5();
    
}, []);
  
  const [popupOpen, setPopupOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<{ title: string; content: string; timestamp: string; publishedDate: string; }>({
    title: '',
    publishedDate: '',
    content: '',
    timestamp: '',
    // image: null,
  });

  const profileProtocolDefinition = () => {
    return {
      protocol: "https://did-box.com",
      published: true,
      types: {
        personalDetails: {
          schema: "https://did-box.com/schemas/personalDetails",
          dataFormats: ["application/json"],
        },
        healthDetails: {
          schema: "https://did-box.com/schemas/healthDetails",
          dataFormats: ["application/json"],
        },
        educationDetails: {
          schema: "https://did-box.com/schemas/educationDetails",
          dataFormats: ["application/json"],
        },
        professionDetails: {
          schema: "https://did-box.com/schemas/workDetails",
          dataFormats: ["application/json"],
        },
        socialDetails: {
          schema: "https://did-box.com/schemas/socialDetails",
          dataFormats: ["application/json"],
        },
        letterDetails: {
          schema: "https://did-box.com/schemas/letterDetails",
          dataFormats: ["application/json"],
        },
        pictureDetails: {
          schema: "https://did-box.com/schemas/pictureDetails",
          dataFormats: ['image/jpg', 'image/png', 'image/jpeg', 'image/gif']
        },
        videoDetails: {
          schema: "https://did-box.com/schemas/videoDetails",
          dataFormats: ["video/mp4", "video/mpeg", "video/ogg", "video/quicktime", "video/webm", "video/x-ms-wmv"],
        },
        documentDetails: {
          schema: "https://did-box.com/schemas/documentDetails",
          dataFormats: ['application/octet-stream', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        },
      },
      structure: {
        personalDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "personalDetails", can: "read" },
            { who: "recipient", of: "personalDetails", can: "read" },
          ],
        },
        healthDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "healthDetails", can: "read" },
            { who: "recipient", of: "healthDetails", can: "read" },
          ],
        },
        educationDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "educationDetails", can: "read" },
            { who: "recipient", of: "educationDetails", can: "read" },
          ],
        },
        professionDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "professionDetails", can: "read" },
            { who: "recipient", of: "professionDetails", can: "read" },
          ],
        },
        socialDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "socialDetails", can: "read" },
            { who: "recipient", of: "socialDetails", can: "read" },
          ],
        },
        letterDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "letterDetails", can: "read" },
            { who: "recipient", of: "letterDetails", can: "read" },
          ],
        },
        pictureDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "pictureDetails", can: "read" },
            { who: "recipient", of: "pictureDetails", can: "read"}
          ],
        },
        videoDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "videoDetails", can: "read" },
            { who: "recipient", of: "videoDetails", can: "read" },
          ],
        },
        documentDetails: {
          $actions: [
            { who: "anyone", can: "write" },
            { who: "author", of: "documentDetails", can: "read" },
            { who: "recipient", of: "documentDetails", can: "read"}
          ],
        },
      },
    };
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    const file = e.target.files?.[0];
  
      if (file) {
        setSelectedFileName(file.name);
      }
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddLetter = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); 
  
    const requiredFields = ['title', 'content', 'publishedDate'];
    const emptyFields = requiredFields.filter((field) => !formData[field]);
  
    if (emptyFields.length > 0) {
      toast.error('Please fill in all required fields.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
      requiredFields.forEach((field) => {
        if (!formData[field]) {
          const inputElement = document.querySelector(`[name="${field}"]`);
          if (inputElement) {
            inputElement.parentElement?.classList.add('error-outline');
          }
        }
      });
      setLoading(false);
      return; 
    }
      
    const formdata = new FormData();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const timestamp = `${currentDate} ${currentTime}`;
    formdata.append("title", formData.title);
    formdata.append("content", formData.content);
    formdata.append("publishedDate", formData.publishedDate);
    try {
      let record;
      console.log(formData);
      record = await writeLetterToDwn({...formData, timestamp});
      console.log(record);
      if (record) {
        const { status } = await record.send(myDid);
        console.log("Send record status in handleAddLetter", status);
      } else {
        toast.error('Failed to create letteral record', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
          });
          setLoading(false);
        throw new Error('Failed to create letteral record');       
      }
  
      setFormData({
        title: '',
        publishedDate: '',
        content: '',
        timestamp: '',
      });
  
      setPopupOpen(false);
      toast.success('Successfully created letteral record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
  
      setLoading(false);
  
    } catch (err) {
        console.error('Error in handleAddLetter:', err);
        toast.error('Error in handleAddLetter. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000, // Adjust the duration as needed
        });
        setLoading(false);
      } 
  };
  
  

     const writeLetterToDwn = async (letterData) => {
      const dateToFormat = new Date(formData.publishedDate);

      // if (isNaN(dateToFormat.getTime())) {
      //   console.error('Invalid date');
      // } else {
        // Format the date and time in YYYY-MM-DDThh:mm:ss.ssssssZ format
        const formattedDate = dateToFormat.toISOString().replace(/\.\d{3}Z$/, '.000000Z');
        console.log(formattedDate);
      // }
      try {
        const letterProtocol = profileProtocolDefinition();
        const { record, status } = await web5.dwn.records.write({
          data: letterData,
          message: {
            protocol: letterProtocol.protocol,
            protocolPath: 'letterDetails',
            schema: letterProtocol.types.letterDetails.schema,
            recipient: myDid,
            published: true,
            datePublished: formattedDate,
          },
        });
        console.log(record);
  
        if (status === 200) {
          return { ...letterData, recordId: record.id}
        } 
        console.log('Successfully wrote letteral details to DWN:', record);
        toast.success('Letter Details written to DWN', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        return record;
      } catch (err) {
        console.error('Failed to write letter details to DWN:', err);
        toast.error('Failed to write letter details to DWN. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
     }; 

  return (
    <div className="w-full md:w-3/5 flex justify-between rounded-lg border border-stroke bg-white py-7.5 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
       <div className="">
          <h4 className="text-2xl font-bold text-black dark:text-white">
           Send a letter into the Future 🚀
          </h4>
          <button
            ref={trigger}
            onClick={() => setPopupOpen(!popupOpen)}
            className="inline-flex mt-30 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10">
            Write Letter
          </button>
          {popupOpen && (
                <div
                  ref={popup}
                  className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                >
                  <div
                    className="bg-white lg:mt-15 lg:w-1/2 rounded-lg pt-3 px-4 shadow-md"
                    style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'scroll' }}
                  >
                    <div className="flex flex-row justify-between">
                      <h2 className="text-xl font-semibold mb-4">Add Letter Details</h2>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setPopupOpen(false)} 
                          className="text-blue-500 hover:text-gray-700 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 fill-current bg-primary rounded-full p-1 hover:bg-opacity-90"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <form>
                    <div className= "rounded-sm px-6.5 bg-white dark:border-strokedark dark:bg-boxdark">

                    <div className="mb-4.5 flex flex-col gap-6">
                    <div className="w-full">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Title
                        </label>
                        <div className={`relative ${formData.title ? 'bg-light-blue' : ''}`}>
                        <input
                          type="title"
                          name="title"
                          value={formData.title}
                          required
                          onChange={handleInputChange}
                          placeholder="Letter to the future"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>

                      <div className="w-full">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Content
                        </label>
                        <div className={`relative ${formData.content ? 'bg-light-blue' : ''}`}>
                        <textarea
                          name="content"
                          required
                          rows={6}
                          value={formData.content}
                          onChange={handleInputChange}
                          placeholder="A Letter into the Future"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>


                     <div className="w-full">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Publshed Date
                        </label>
                        <div className={`relative ${formData.publishedDate ? 'bg-light-blue' : ''}`}>
                        <input
                           type="date" 
                          name="publishedDate"
                          required
                          value={formData.publishedDate}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus-border-primary"/>
                        </div>
                      </div>                     
                    </div>            
                  </div>
                    </form>
                      <button
                        type="button"
                        onClick={handleAddLetter}
                        disabled={loading}
                        className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="spinner"></div>
                            <span className="pl-1">Sending...</span>
                          </div>
                        ) : (
                          <>Send Letter</>
                        )}
                      </button>
                  </div>
                </div>
              )}
        </div>
        <div>
          <img src={Image} width={200} height={200} />
        </div>
      </div>
  );
};

export default LetterCard;
