import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./Header"
import ImageList from "./ImageList"
import AddImage from "./AddImage"

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<ImageList />} />
          <Route path="/add" element={<AddImage />} />
          <Route path="/*" element={<span>404</span>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
