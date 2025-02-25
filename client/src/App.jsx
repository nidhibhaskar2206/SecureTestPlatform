import { Route, Routes } from "react-router-dom";
import {Provider} from 'react-redux'
import store from "./redux/store";
import TestPage from "./screens/TestPage";
import HomePage from "./screens/HomePage";
import InstructionsPage from "./screens/InstructionsPage";
import LoginPage from "./screens/Login";
import RegisterPage from "./screens/Register";
import ForgetPage from "./screens/Forgot";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContactPage from "./screens/Contact";
import TestCreation from "./components/core/dashboard/tests/TestCreation";
import AddQuestionsAndOptions from "./components/core/dashboard/tests/AddQuestionsAndAnswers";
import TestsList from "./components/core/dashboard/tests/TestList";
import NotFound from "./screens/NotFound";
import TestPreview from "./components/core/dashboard/tests/TestPreview";

function App() {
  return (
    <Provider store={store}>
      <ToastContainer
        position="top-right"
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
        <Route path="*" element={<NotFound/>}/>
        <Route path="/test" element={<TestPage />} />
        <Route path="/forget-password" element={<ForgetPage/>}/>
        <Route path="/instructions" element={<InstructionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="/contact" element={<ContactPage/>}/>
        <Route path="/test-creation" element={<TestCreation/>} />
        <Route path="/addques" element={<AddQuestionsAndOptions/>}/>
        <Route path="/testslist" element={<TestsList/>}/>
        <Route path="/test-preview/:testId" element={<TestPreview/>}/>
      </Routes>
    </Provider>
  );
}

export default App;
