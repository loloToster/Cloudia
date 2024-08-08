import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState
} from "react"

export interface SearchContextI {
  searchQuery: string,
  setSearchQuery: Dispatch<SetStateAction<string>>
}

export const SearchContext = createContext<SearchContextI>({
  searchQuery: "",
  setSearchQuery: () => null
})

export const SearchContextProvider = (props: {
  children: React.ReactNode
}) => {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <SearchContext.Provider value={{
      searchQuery, setSearchQuery
    }}>
      {props.children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  return useContext(SearchContext)
}
