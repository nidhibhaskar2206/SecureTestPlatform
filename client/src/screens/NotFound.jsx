import { Link } from "react-router-dom";
import NF from "../assets/NotFound.png";
import Header from "../components/common/Header"

const NotFound = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-100 to-slate-50">
      <div className="w-full fixed top-0">
      <Header/>
      </div>
      <div>
        <div>
          <img src={NF} alt="GIF" className="w-[40rem] h-[40rem] mb-16"/>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-5xl font-extrabold ">404 - Not Found!</h1>
          <Link to="/" className="px-4 py-2 text-white text-xl font-extrabold text-center bg-orange-500 rounded-md inline-block">Go Home</Link>
        </div>
      </div>
     
      
    </div>
  );
};

export default NotFound;
