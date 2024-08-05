/*************************************************************************/
/*  SearchAndFilterContextProvider.tsx                                   */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import {
  useState, createContext, useContext, PropsWithChildren, useEffect,
} from 'react'

type SearchAndFilterContextType = {
  query: string;
  setQuery: (query: string) => void;
  filters: string[];
  setFilters: (filters: string[]) => void;
  setFilter: (args: SetFilterArgs) => void;
  onSearch?: (query: string) => void;
}

type SetFilterArgs = {
  filterType: string;
  filterValue: string;
  replace?: boolean;
}

const SearchAndFilterContext = createContext<SearchAndFilterContextType>({
  query: '',
  setQuery: () => {},
  filters: [],
  setFilters: () => {},
  setFilter: () => { },
  onSearch: () => {},
})

export const useSearchAndFilterContext = () => useContext(SearchAndFilterContext)

type SearchAndFilterProviderProps = {
  onSearch?: (query: string) => void;
} & PropsWithChildren<React.HTMLProps<HTMLDivElement>>

// Wraps the table and the search bar, so that they can share state
export default function SearchAndFilterContextProvider({
  onSearch, children,
}: SearchAndFilterProviderProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<string[]>([])

  useEffect(() => {
    // When the query updates, run the function that refetches the table data
    if (onSearch) onSearch(query)
    // Update the list of filters (used in TableFilterCell to show which filters are active)
    setFilters(query.split(' ').filter((q) => q.includes(':')))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  function setFilter({ filterType, filterValue, replace = true }: SetFilterArgs) {
    setQuery((prev) => {
      const newFilter = `${filterType}:${filterValue}`
      const filterRegex = /\S+?:\S+/g
      let updatedFilters: string[] = prev.match(filterRegex) || []
      const queryWithoutFilters = prev.replace(filterRegex, '').replace(/\s+/g, ' ').trim()
      const createUpdatedQuery = () => (`${updatedFilters.join(' ')} ${queryWithoutFilters.trim()}`).trim()
      // Special case to remove all the existing filters if the new filter is clear-filters:true
      if (newFilter === 'clear-filters:true') {
        updatedFilters = []
        return createUpdatedQuery()
      }
      // Toggle off the filter if it already exists
      if (updatedFilters.includes(newFilter)) {
        updatedFilters = updatedFilters.filter((f) => f !== newFilter)
        return createUpdatedQuery()
      }
      if (replace) {
        // Replace the filter if it already exists, otherwise add it
        const existingFilter = updatedFilters.find((f) => f.startsWith(filterType))
        if (existingFilter) {
          updatedFilters = updatedFilters.filter((f) => f !== existingFilter)
        }
        updatedFilters.push(newFilter)
        return createUpdatedQuery()
      }
      updatedFilters.push(newFilter)
      return createUpdatedQuery()
    })
  }

  return (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
    <SearchAndFilterContext.Provider value={{
      query, setQuery, filters, setFilters, setFilter, onSearch,
    }}
    >
      {children}
    </SearchAndFilterContext.Provider>
  )
}
