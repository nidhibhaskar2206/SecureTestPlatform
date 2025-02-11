import React from "react";
import Header from "../common/Header";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();
  return (
    <div className="relative w-screen min-h-screen flex flex-col justify-center items-center">
      <div className="fixed top-0 w-full">
        <Header />
      </div>
      <div className="mt-28">
      <button onClick={()=> navigate('instructions')} className="bg-orange-400 hover:bg-orange-500 px-4 py-2 text-white">Start</button>
      </div>
      
    </div>
  );
};

export default HomePage;
