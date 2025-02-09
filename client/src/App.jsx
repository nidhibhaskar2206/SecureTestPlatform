import { Route, Routes } from "react-router-dom";
import TestPage from "./components/screens/TestPage";
import HomePage from "./components/screens/HomePage";

function App() {
  return(
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/test" element={<TestPage/>} />
      </Routes>
    </div>
  )
}

export default App;
