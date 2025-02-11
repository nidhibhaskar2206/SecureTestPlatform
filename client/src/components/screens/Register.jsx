import React, { useState } from "react";
import { Link } from "react-router-dom";
import login from "../../assets/login.jpg";
import logo from "../../assets/logo_bgless.png";
import Header from "../common/Header";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { firstName, lastName, email, password } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    toast.success("Registered Successfull!");
  };

  return (
    <div className="w-screen h-[100vh] overflow-hidden">
      {/* Image section */}
      <Header />
      <div className="flex">
        <div className="lg:w-1/2">
          <img src={login} alt="login" className="w-full h-full" />
        </div>
        {/* Form section */}
        <div className="lg:w-1/2 flex flex-col justify-center items-center">
          {/* Header */}
          <div>
            <div>
              <img src={logo} alt="logo" className="w-auto h-" />
            </div>
            <div className="ml-6 mt-4 text-center text-4xl font-bold">
              Register to Secure Test
            </div>
          </div>
          {/* Form*/}
          <div className="mt-16 w-[70%]">
            <form
              onSubmit={handleOnSubmit}
              className="mt-6 flex w-full flex-col gap-y-4"
            >
              <label className="w-full">
                <p className="mb-4 text-xl leading-[1.375rem] text-richblack-5 font-[500]">
                  First Name <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleOnChange}
                  placeholder="Enter first name"
                  className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.125px] focus:outline-gray-300"
                />
              </label>
              <label className="w-full">
                <p className="mb-4 text-xl leading-[1.375rem] text-richblack-5 font-[500]">
                  Last Name <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleOnChange}
                  placeholder="Enter last name"
                  className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.125px] focus:outline-gray-300"
                />
              </label>
              <label className="w-full">
                <p className="mb-4 text-xl leading-[1.375rem] text-richblack-5 font-[500]">
                  Email Address <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="email"
                  value={email}
                  onChange={handleOnChange}
                  placeholder="Enter email address"
                  className="form-style w-full border px-4 py-2 rounded-md focus:outline-[0.125px] focus:outline-gray-300"
                />
              </label>
              <label className="relative mt-2">
                <p className="mb-4 text-xl leading-[1.375rem] text-richblack-5 font-[500]">
                  Password <sup className="text-pink-500">*</sup>
                </p>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter Password"
                  className="form-style w-full !pr-10 border px-4 py-2 rounded-md focus:outline-[0.125px] focus:outline-gray-300"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[46px] z-[10] cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={24} fill="#6B7280" />
                  ) : (
                    <AiOutlineEye fontSize={24} fill="#6B7280" />
                  )}
                </span>
              </label>
              <Link to="/login">
                <p className="text-center hover:underline underline-offset-2 text-orange-500">
                  Already a member? Login
                </p>
              </Link>
              <button
                type="submit"
                className="mt-6 rounded-[8px] bg-orange-400 py-[8px] px-[12px] font-medium text-richblack-900"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
