import { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
const DocumentDetails = () => {
  
  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);

  const [usersDetails, setUsersDetails] = useState<User[]>([]);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [isDeleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false)
  const [formData, setFormData] = useState<{ document: File | null }>({
    document: null,
  });

  const [showDetails, setShowDetails] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const [documentURLs, setDocumentURLs] = useState<string[]>([]);

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

const fetchDocumentDetails = async () => {
  setFetchDetailsLoading(true);
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
    console.log('Document Details:', response);

  response.records.forEach( async (documentRec) => {
  console.log('this is the each document record', documentRec);
  // Get the blob of the document data
  const documentId = documentRec.id;
  console.log(documentId);
    const {record, status }= await web5.dwn.records.read({
      message: {
        filter: {
          recordId: documentId,
         },
      },
    });
  console.log ({record, status})

  const documentResult = await record.data.blob();
  console.log(documentResult)
  const documentURL = URL.createObjectURL(documentResult);
  console.log(documentURL)
  setDocumentURLs(prevDocumentURLs => [...prevDocumentURLs, documentURL]);
  });
  toast.success('Successfully fetched document details', {
    position: toast.POSITION.TOP_RIGHT,
    autoClose: 3000,
  });

    setFetchDetailsLoading(false);

  } catch (err) {
    console.error('Error in fetchDocumentDetails:', err);
    toast.error('Error in fetchDocumentDetails. Please try again later.', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
    });
    setFetchDetailsLoading(false);
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
        console.log('Document Details deleted successfully');
        toast.success('Document Details deleted successfully', {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000, 
        });
        setUsersDetails(prevDocumentDetails => prevDocumentDetails.filter(message => message.recordId !== recordId));
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

// deleteDocumentDetails("bafyreie7tqntvzj5azpomhx5xqzoccs2ejk3773gg52cyffajbawo3sdjy");

  return (
    <div className="lg:mx-5 flex flex-col rounded-lg border break-words border-stroke bg-white p-10 shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="flex flex-row mb-5 items-center gap-4 justify-end">
     <button 
       onClick={fetchDocumentDetails}
       className=" items-center  rounded-full bg-primary py-3 px-10 text-center font-medium text-white hover-bg-opacity-90">
       {fetchDetailsLoading ? (
         <div className="flex items-center">
           <div className="spinner"></div>
           <span className="pl-1">Fetching...</span>
         </div>
       ) : (
         <>Fetch Documents</>
       )}           
     </button>
   </div>
   {documentURLs.length > 0 ? (
     <div className="flex flex-col lg:flex-row flex-wrap">
     {documentURLs.map((document, index) => (
     <div className="flex w-full lg:w-2/5" key={index}>
      <div className='mb-5'>
        <div>
          <Document file={document}>
            <Page pageNumber={1} />
          </Document>
        </div>
        <div className='w-full flex flex-row justify-evenly mb-5'>
         <div className="relative">
           <button
             onClick={() => showDeleteConfirmation(document.recordId)}
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
                       deleteDocumentDetails(document.recordId);
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
  );
};

export default DocumentDetails;
