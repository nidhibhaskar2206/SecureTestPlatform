import React from "react";
import Header from "../common/Header";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();
  return (
    <div className="relative w-screen">
      <div className="fixed top-0 w-full">
        <Header />
      </div>
      <div className="mt-28">
      <button onClick={()=> navigate('test')}>Start</button>
      </div>
      
    </div>
  );
};

export default HomePage;
