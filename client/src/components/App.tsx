import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./Header"
import FileList from "./FileList"
import AddFile from "./AddFile"
import FileDetails from "./FileDetails"

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<FileList />} />
          <Route path="/add" element={<AddFile />} />
          <Route path="/file/:id" element={<FileDetails />} />
          <Route path="/*" element={<span>404</span>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
