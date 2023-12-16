/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Web5 } from "@web5/api/browser";
import { createContext, useEffect, useState } from "react";
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

export const Web5Context = createContext();

const ContextProvider = ({ children }) => {
  const [web5, setWeb5] = useState(null);
  const [myDid, setMyDid] = useState(null);

  useEffect(() => {
    const connectWeb5 = async () => {
      try {
        const { web5, did } = await Web5.connect({sync: '5s'});
          setWeb5(web5);
          setMyDid(did);
          console.log(web5);
          if (web5 && did) {
            toast.success('Connected to Web5', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000, 
            });
          }
      } catch (error) {
        console.error("Error Connecting to web5 : ", error);
      }
    };
    connectWeb5();
  }, []);

  const profileProtocolDefinition = {
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


  useEffect(() => {
        const queryLocalProtocol = async (web5: any, url: string) => {
        return await web5.dwn.protocols.query({
        message: {
            filter: {
            protocol: "https://did-box.com",
            },
        },
        });
    };


    const queryRemoteProtocol = async (web5: any, did: string, url: string) => {
        return await web5.dwn.protocols.query({
        from: did,
        message: {
            filter: {
            protocol: "https://did-box.com",
            },
        },
        });
    };

    const installLocalProtocol = async (web5: any, protocolDefinition: any) => {
        return await web5.dwn.protocols.configure({
        message: {
            definition: protocolDefinition,
        },
        });
    };

    const installRemoteProtocol = async (web5: any, did: string, protocolDefinition: any) => {
        const { protocol } = await web5.dwn.protocols.configure({
        message: {
            definition: protocolDefinition,
        },
        });
        return await protocol.send(did);
    };

    const configureProtocol = async (web5, did) => {
        const protocolDefinition = profileProtocolDefinition ;
        const protocolUrl = protocolDefinition.protocol;

        const { protocols: localProtocols, status: localProtocolStatus } = await queryLocalProtocol(web5, protocolUrl);
        if (localProtocolStatus.code !== 200 || localProtocols.length === 0) {
        const result = await installLocalProtocol(web5, protocolDefinition);
        console.log({ result })
        toast.success('Protocol installed locally', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000, 
        });
        } else {
        toast.success('Protocol already installed locally', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000, 
        });
        }

        const { protocols: remoteProtocols, status: remoteProtocolStatus } = await queryRemoteProtocol(web5, did, protocolUrl);
        if (remoteProtocolStatus.code !== 200 || remoteProtocols.length === 0) {
        const result = await installRemoteProtocol(web5, did, protocolDefinition);
        console.log({ result })
        toast.success('Protocol installed remotely', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000, 
        });
        }  else {
        toast.success('Protocol already installed remotely', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000, 
        });
        }
    };
    
    if (web5 && myDid) {
        configureProtocol(web5, myDid);;
    }
  }, [web5, myDid]);

  const value = {
    web5,
    myDid,
    profileProtocolDefinition,
  };

  return (
    <div>
      <Web5Context.Provider value={value}>{children}</Web5Context.Provider>
    </div>
  );
};

export default ContextProvider;
