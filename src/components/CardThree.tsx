import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
const CardThree = () => {
  return (
    <div className="flex justify-between rounded-lg border border-stroke bg-white py-3 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
       <div className="flex justify-between">
        <div>
        <span className="text-sm font-medium">App Downloads</span>
          <h4 className="text-title-sm text-black dark:text-white">
            100
          </h4>
        </div>
      </div>
      
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded bg-primary dark:bg-meta-4">
      <FontAwesomeIcon icon={faCircleDown} style={{color: "#ffffff",}} />
      </div>
    </div>
  );
};

export default CardThree;
