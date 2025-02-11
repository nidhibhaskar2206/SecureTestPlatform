import { Route, Routes } from "react-router-dom";
import TestPage from "./components/screens/TestPage";
import HomePage from "./components/screens/HomePage";
import InstructionsPage from "./components/screens/InstructionsPage";

function App() {
  return(
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/test" element={<TestPage/>} />
        <Route path="/instructions" element={<InstructionsPage/>}/>
      </Routes>
    </div>
  )
}

export default App;
