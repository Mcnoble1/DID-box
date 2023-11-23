import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../images/logo/logo.png';
import Object from '../images/logo/objects.svg';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './signin.css';


const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State for Remember Me checkbox
  const navigate = useNavigate();

  useEffect(() => {
    // When the component mounts, check localStorage for email and rememberMe values
    const savedEmail = localStorage.getItem('email');
    const savePassword = localStorage.getItem('pass');
    const savedRememberMe = localStorage.getItem('rememberMe');

    if (savedEmail && savedRememberMe === 'true') {
      setEmail(savedEmail);
      setPassword(savePassword);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in both email and password fields', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
      });
      return;
    }

    try {
      setLoading(true);

      const url = 'https://madad.onrender.com/api/admin/login';

      const data = new URLSearchParams();
      data.append('email', email);
      data.append('password', password);

      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post(url, data, config);
      const { data: { token } } = response;
      setLoading(false);

      localStorage.setItem('token', token);
      localStorage.setItem('user', email);
      if (rememberMe) {
        // If Remember Me is checked, save email and rememberMe in localStorage
        localStorage.setItem('email', email);
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('pass', password);
      } else {
        // If Remember Me is not checked, remove email and rememberMe from localStorage
        localStorage.removeItem('email');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('pass');
      }

      navigate('/dashboard');
    } catch (error) {
      toast.error('Username or Password is incorrect', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 4000,
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
          <Link className="mb-5.5 inline-block" to="/">
              <img className="hidden dark:block" src={Logo} width={50} height={50} alt="Logo" />
              <img className="dark:hidden" src={Logo} width={50} height={50} alt="Logo" />
            </Link>
            <h2 className="mb-1 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              Welcome Back
            </h2>
            <span className="mb-9 block font-medium">Enter your Email and Password to sign in</span>


            <form onSubmit={handleSignIn}>
              <div className="mb-4">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Username / Email address
                </label>
                <div className={`relative ${email ? 'bg-light-blue' : ''}`}>
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

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Password
                </label>
                <div className={`relative ${password ? 'bg-light-blue' : ''}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <span
                      className="absolute right-4 top-4 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                    >
                      {showPassword ? (
                        <svg
                          className="fill-current"
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {/* Replace with your eye icon when the password is visible */}
                          <svg
                              width="22"
                              height="22"
                              viewBox="0 0 22 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M16.5 11C16.5 12.933 14.933 14.5 13 14.5C11.067 14.5 9.5 12.933 9.5 11C9.5 9.067 11.067 7.5 13 7.5C14.933 7.5 16.5 9.067 16.5 11ZM12 3C4.834 3 3 11 3 11C3 11 4.834 19 12 19C19.166 19 21 11 21 11C21 11 19.166 3 12 3ZM11 15H13V13H11V15ZM11 9H13V7H11V9Z"
                                fill="#000000"
                              />
                            </svg>

                        </svg>
                      ) : (
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
                              d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                              fill=""
                            />
                            <path
                              d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      )}
                    </span>
                </div>
              </div>

              <div className="mb-9">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe} // Set checked state to checked prop
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-600">Remember Me</span>
              </label>
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
                {loading ? 'Signing In...' : 'Sign In'} {/* Change button text based on loading state */}
              </button>
            </div>
             

              <div className="mb-9">
                <p>
                  <Link to="forgot-password" className="">
                    Forgot password?
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
