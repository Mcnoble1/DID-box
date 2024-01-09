import { useState, useEffect, useRef, useContext, ChangeEvent, FormEvent } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Image from '../../images/user/onee.png';
import { Web5Context } from "../../utils/Web5Context";
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../../pages/signin.css';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const Documents = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { web5, myDid, profileProtocolDefinition } = useContext( Web5Context);
  const [usersDetails, setUsersDetails] = useState<User[]>([]);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [recipientDid, setRecipientDid] = useState("");
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<{ document: File | null }>({
    document: null,
  });
  const [documentURLs, setDocumentURLs] = useState<string[]>([]);

  useEffect(() => {
    if (web5 && myDid) {
    fetchDocumentDetails();
    }
  }, [web5, myDid]);

  const fetchDocumentDetails = async () => {
    try {
      const response = await web5.dwn.records.query({
        from: myDid,
        message: {
          filter: {
              protocol: 'https://did-box.com',
              protocolPath: 'documentDetails',
          },
        },
      });
  
    response.records.forEach( async (documentRec) => {
    // Get the blob of the document data
    const documentId = documentRec.id;
      const {record, status }= await web5.dwn.records.read({
        message: {
          filter: {
            recordId: documentId,
           },
        },
      });
  
    const documentResult = await record.data.blob();
    const documentURL = URL.createObjectURL(documentResult);
    setDocumentURLs(prevDocumentURLs => [...prevDocumentURLs, {documentURL, documentId}]);
    });
    toast.success('Successfully fetched document details', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    });
  
    } catch (err) {
      console.error('Error in fetchDocumentDetails:', err);
      toast.error('Error in fetchDocumentDetails. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
    };
  };
  
  const showDeleteConfirmation = (documentId: string) => {
      setUserToDeleteId(documentId);
      setDeleteConfirmationVisible(true);
    };
  
    const hideDeleteConfirmation = () => {
      setUserToDeleteId(null);
      setDeleteConfirmationVisible(false);
    };
  
  const deleteDocumentDetails = async (recordId) => {
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
        
        if (deleteResult.status.code === 202) {
          toast.success('Document Details deleted successfully', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000, 
          });
          setDocumentURLs(prevDocumentDetails => prevDocumentDetails.filter(message => message.documentId !== recordId));
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
      console.error('Error in deleteDocumentDetails:', error);
    }
  };

  const shareDocumentDetails = async (recordId: string) => {
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
        console.log('Send record status in shareDocument', status);
        toast.success('Successfully shared document', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
        setShareLoading(false);
        setSharePopupOpen(false);
      } else {
        console.error('No record found with the specified ID');
        toast.error('Failed to share document', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
      setShareLoading(false);
    } catch (err) {
      console.error('Error in shareDoc:', err);
      toast.error('Error in shareDoc. Please try again later.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 5000,
      });
      setShareLoading(false);
    }
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

  const handleAddDocument = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); 
  
    const requiredFields = ['document'];
    const emptyFields = requiredFields.filter((field) => !formData[field]);
  
    if (emptyFields.length > 0) {
      toast.error('Please add a document.', {
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
    formdata.append('document', fileInputRef.current?.files?.[0], fileInputRef.current?.files?.[0].name);

    const blob = new Blob(fileInputRef.current.files, { type: 'application/pdf' });   
    
    try {
      let record;
      console.log(blob);
      record = await writeDocumentToDwn(blob);
      console.log(record);
      if (record) {
        const { status } = await record.send(myDid);
        console.log("Send record status in handleAddDocument", status);
      } else {
        toast.error('Failed to create document record', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
          });
          setLoading(false);
        throw new Error('Failed to create document record');       
      }
  
      setFormData({
        document: null,
      });
      setSelectedFileName("Click to add Document")
      fetchDocumentDetails();
      setPopupOpen(false);
      toast.success('Successfully created document record', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000, 
      });
  
      setLoading(false);
  
    } catch (err) {
        console.error('Error in handleAddDocument:', err);
        toast.error('Error in handleAddDocument. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 5000, // Adjust the duration as needed
        });
        setLoading(false);
      } 
  };
  
     const writeDocumentToDwn = async (documentData) => {
      try {
        const documentProtocol = profileProtocolDefinition;
        const { record, status } = await web5.dwn.records.write({
          data: documentData,
          message: {
            protocol: documentProtocol.protocol,
            protocolPath: 'documentDetails',
            schema: documentProtocol.types.documentDetails.schema,
            recipient: myDid,
            dataFormat: "application/pdf"
          },
        });
        console.log(record);
  
        if (status === 200) {
          return { ...documentData, recordId: record.id}
        } 
        console.log('Successfully wrote documental details to DWN:', record);
        toast.success('Document Details written to DWN', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        return record;
      } catch (err) {
        console.error('Failed to write document details to DWN:', err);
        toast.error('Failed to write document details to DWN. Please try again later.', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
        });
      }
     }; 

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <div className="flex flex-row flex-wrap justify-evenly gap-5 md:gap-0">
                <div className="w-full flex justify-between rounded-lg border border-stroke bg-white py-7.5 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="">
                      <h4 className="text-2xl font-bold text-black dark:text-white">
                        Document Details
                      </h4>
                      <button
                        ref={trigger}
                        onClick={() => setPopupOpen(!popupOpen)}
                        className="inline-flex mt-10 items-center justify-center rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10">
                        Add Document
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
                                  <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
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
                                <div className="mb-4.5 flex flex-col gap-3">
                                  <label className="mb-2.5 block text-black dark:text-white">
                                  Document
                                  </label>
                                  <div
                                    id="FileUpload"
                                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                                  >
                                    <input
                                      type="file"
                                      name='document'
                                      accept='application/pdf'
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
                                        {selectedFileName ? selectedFileName : 'Click to add Document'}                            
                                          </span> 
                                      </p>
                                    </div>
                                  </div>
                                </div>            
                              </div>
                                </form>
                                  <button
                                    type="button"
                                    onClick={handleAddDocument}
                                    disabled={loading}
                                    className={`mr-5 mb-5 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    {loading ? (
                                      <div className="flex items-center">
                                        <div className="spinner"></div>
                                        <span className="pl-1">Sending...</span>
                                      </div>
                                    ) : (
                                      <>Send Document</>
                                    )}
                                  </button>
                              </div>
                            </div>
                          )}
                    </div>
                    <div>
                      <img src={Image} width={120} height={120} />
                    </div>
                  </div>
              </div>

              <div className="mt-4">
                <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
                {documentURLs.length > 0 ? (
                  <div className="flex flex-col lg:flex-row flex-wrap">
                  {documentURLs.map((document, index) => (
                  <div className="flex w-full lg:w-2/5" key={index}>
                    <div className='mb-5'>
                      <div>
                        <Document file={document.documentURL}>
                          <Page pageNumber={1} />
                        </Document>
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
                                      <h2 className="text-xl font-semibold mb-4">Share Document</h2>
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
                                      onClick={() => shareDocumentDetails(document.documentId)}
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
                          onClick={() => showDeleteConfirmation(document.documentId)}
                          className="inline-flex items-center justify-center rounded-full bg-danger py-3 px-7 text-center font-medium text-white hover-bg-opacity-90 lg:px-8 xl:px-10"
                        >
                          Delete
                        </button>
                        {isDeleteConfirmationVisible && (
                          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
                            <div className="bg-white p-5 rounded-lg shadow-md">
                              <p>Are you sure you want to delete this document?</p>
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
                                    deleteDocumentDetails(document.documentId);
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
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documents;



