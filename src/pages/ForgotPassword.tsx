import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoDark from '../images/logo/logo-dark.svg';
import Logo from '../images/logo/logo.svg';
import Object from '../images/logo/objects.svg';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault(); 
    // Prevent the default form submission behavior
  
    if (!email) {
      // Display an error message or prevent the form submission
      toast.error('Please fill in your email address.', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000, // Adjust the duration as needed
      });      
      return;
    }
  
    try {
      setLoading(true); // Set loading state to true

      const url = "https://madad.onrender.com/api/admin/forgot-password";
  
      const data = new URLSearchParams();
      data.append("email", email);
  
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };
  
      const response = await axios.post(url, data, config);

      setLoading(false); 
      toast.success('Email sent successfully', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000, // Adjust the duration as needed
      }); 

      // Redirect to the dashboard or handle success as needed
    } catch (error) {
      toast.error('Enter a valid Email', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000, // Adjust the duration as needed
      });   
      setLoading(false); 
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-screen flex-wrap items-center">
          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            {/* <Link className="mb-5.5 inline-block" to="/">
                <img className="hidden dark:block" src={Logo} alt="Logo" />
                <img className="dark:hidden" src={LogoDark} alt="Logo" />
              </Link> */}
              <h2 className="mb-1 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Recover your password
              </h2>
              <span className="mb-9 block font-medium">Enter your Email to get your sign in details</span>


              <form onSubmit={handleSignIn}>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <span className="absolute right-4 top-4">
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.5">
                          <path
                            d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                            fill=""
                          />
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

              <div className="mb-5">
              <button
                  type="submit"
                  onClick={handleSignIn}
                  className={`w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 ${
                    loading ? 'opacity-50 cursor-wait' : '' // Disable the button and change cursor when loading
                  }`}
                  disabled={loading} // Disable the button when loading
                >
                  {loading ? 'Submitting...' : 'Submit'} {/* Change button text based on loading state */}
                </button>
              </div>
               

                <div className="mb-9">
                  <p>
                    <Link to="/" className="">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <div className="hidden h-screen w-full xl:block xl:w-1/2 bg-primary border-stroke dark:border-strokedark xl:border-l-2">
            <div className="px-26 text-center">
              <span className="inline-block">
              <img className="dark:hidden h-screen" src={Object} alt="Signin image" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
