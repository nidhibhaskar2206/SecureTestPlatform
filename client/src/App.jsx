import { Route, Routes } from "react-router-dom";
import TestPage from "./components/screens/TestPage";
import HomePage from "./components/screens/HomePage";
import InstructionsPage from "./components/screens/InstructionsPage";
import LoginPage from "./components/screens/Login";
import RegisterPage from "./components/screens/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        toastStyle={{
          backgroundColor: "#030811",
          color: "#f2ebe3",
          borderColor: "#f2ebe3",
        }}
        progressStyle={{ backgroundColor: "#f2ebe3" }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
