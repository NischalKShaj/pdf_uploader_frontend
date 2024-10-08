// <======================== file for creating the login page for the application ==============>

// importing the required modules
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { AppState } from "../../store";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const isLoggedIn = AppState((state) => state.isLoggedIn);
  const isAuthorized = AppState((state) => state.isAuthorized);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthorized) {
      navigate("/home");
    }
  }, [isAuthorized, navigate]);

  // function for the change event
  const changeEvent: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.currentTarget;
    const { id, value } = target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  // function for login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/login`,
        formData
      );
      if (response.status === 202) {
        const { token, data } = response.data;
        localStorage.setItem("access_token", token);
        isLoggedIn({
          _id: data._id,
          username: data.username,
          email: data.email,
          pdf: data.file,
        });
        navigate("/home");
      }
    } catch (error) {
      setMessage("invalid user details");
      console.error("error", error);
    }
  };

  return (
    <div className="bg-custom w-full flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="relative w-[450px] bg-[rgba(0,0,0,0.2)] backdrop-blur-[25px] border-2 border-[#c6c3c3] rounded-[15px] p-[7.5em_2.5em_4em_2.5em] text-[#ffffff]"
      >
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-[#c6c3c3] w-[140px] h-[70px] rounded-b-[20px]">
          <span className="text-[30px] text-[#000000]">Login</span>
        </div>

        <p className="text-red-500 mt-4">{message}</p>
        <div className="relative flex flex-col items-center my-5">
          <input
            type="email"
            id="email"
            onChange={changeEvent}
            className="input_field peer"
            placeholder=" "
            required
          />
          <label htmlFor="email" className="label">
            email
          </label>
        </div>

        <div className="relative flex flex-col items-center my-5">
          <input
            type="password"
            onChange={changeEvent}
            id="password"
            className="input_field peer"
            placeholder=" "
            required
          />
          <label htmlFor="password" className="label">
            password
          </label>
        </div>

        <div className="relative flex flex-col items-center my-5">
          <button
            type="submit"
            className="w-full h-[45px] bg-[#f71616] text-[16px] font-medium border-none rounded-full cursor-pointer transition-colors duration-300 uppercase hover:bg-[#f53c3c]"
          >
            Login
          </button>
        </div>

        <div className="flex text-center cursor-pointer pt-2">
          <p>Don&apos;t have an account</p>
          <Link to="/signup" className="ml-2 text-blue-500">
            Signup
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
