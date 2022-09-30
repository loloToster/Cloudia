import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./components/Header"

import ItemListPage from "./pages/ItemListPage"
import AddFilePage from "./pages/AddFilesPage"
import FileDetailsPage from "./pages/FileDetailsPage"

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<ItemListPage />} />
          <Route path="/add" element={<AddFilePage />} />
          <Route path="/file/:id" element={<FileDetailsPage />} />
          <Route path="/*" element={<span>404</span>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
