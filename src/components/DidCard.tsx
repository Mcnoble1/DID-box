import { useState, useEffect, useContext } from 'react';
import { Web5Context } from "../utils/Web5Context";
const DidCard = () => {

    const { myDid } = useContext( Web5Context);

  const [didCopied, setDidCopied] = useState(false);

  useEffect(() => {
  
  
  }, []);

  const handleCopyDid = async () => {
    if (myDid) {
      try {
        await navigator.clipboard.writeText(myDid);
        setDidCopied(true);
        setTimeout(() => {
          setDidCopied(false);
        }, 3000);
      } catch (err) {
        console.error("Failed to copy DID: " + err);
      }
    }
  };

  return (
    <div className=" w-full md:w-1/3 p-8 bg-gray flex rounded-lg border border-stroke shadow-default dark:border-strokedark dark:bg-boxdark">
    <div className="wow fadeInUp mb-12 rounded-md dark:bg-dark lg:mb-5 " data-wow-delay=".15s">
        <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
          Your DID
        </h2>
        <p className="mb-7 text-base font-medium text-body-color">
          Decentralized Identifier is your unique digital identity on the Web.
        </p>
        <div className="relative">
          <input
            type="text"
            value={myDid}
            readOnly
            className="w-full rounded-md border border-transparent py-3 px-6 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
          />
          <button
            onClick={handleCopyDid}
            className="absolute text-white right-0 top-0 h-full px-6 py-3 bg-primary rounded-md dark:bg-white dark:text-black"
          >
            {didCopied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
   </div>
  );
};

export default DidCard;
