import { Route, Routes } from "react-router-dom";
import {Provider} from 'react-redux'
import store from "./redux/store";
import TestPage from "./screens/TestPage";
import HomePage from "./screens/HomePage";
import InstructionsPage from "./screens/InstructionsPage";
import LoginPage from "./screens/Login";
import RegisterPage from "./screens/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;
