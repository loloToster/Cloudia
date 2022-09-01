import Header from "./Header"
import ImageList from "./ImageList"

function App() {
  const imgs = [
    { id: 1, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 2, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 3, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 4, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" },
    { id: 5, title: "Some title", user: "user123", src: "https://dummyimage.com/600/ffffff/000" }
  ]

  return (
    <div className="app">
      <Header />
      <ImageList images={imgs} />
    </div>
  )
}

export default App
