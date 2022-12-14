import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import Header from "./components/Header/Header"

import ItemListPage from "./pages/ItemListPage/ItemListPage"
import TrashItemListPage from "./pages/TrashItemListPage/TrashItemListPage"
import AddFilePage from "./pages/AddFilesPage/AddFilesPage"
import FileDetailsPage from "./pages/FileDetailsPage/FileDetailsPage"

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<ItemListPage />} />
          <Route path="/add" element={<AddFilePage />} />
          <Route path="/trash" element={<TrashItemListPage />} />
          <Route path="/file/:id" element={<FileDetailsPage />} />
          <Route path="/*" element={<span>404</span>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
