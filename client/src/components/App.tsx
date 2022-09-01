import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./Header"
import ImageList from "./ImageList"
import AddImage from "./AddImage"

function App() {
  const imgs = [
    { id: 1, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 2, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 3, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 4, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 5, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" }
  ]

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<ImageList images={imgs} />} />
          <Route path="/add" element={<AddImage />} />
          <Route path="/*" element={<span>404</span>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
