/*************************************************************************/
/*  KeyValueSearchContextProvider.tsx                                    */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable no-restricted-syntax */
import {
  useState, createContext, useContext, PropsWithChildren, useEffect, useCallback, useRef,
  useImperativeHandle,
  Ref,
} from 'react'

// Create a context accessible.
const KeyValueSearchContext = createContext<KeyValueSearchContextType>({
  query: '',
  setQuery: () => {},
  keyValues: {},
  searchTerms: [],
  setKeyValue: () => {},
  clearKeyValues: () => {},
  triggerSearch: async () => {},
})
export const useKeyValueSearchContext = () => useContext(KeyValueSearchContext)

export type KeyValueSearchContextType = {
  query: string;
  setQuery: (query: string) => void;
  keyValues: KeyValues;
  searchTerms: SearchTerms;
  setKeyValue: (keyValue: SetKeyValueArgs) => void;
  clearKeyValues: () => void;
  triggerSearch: () => void;
  automaticSearch?: boolean;
}

export type SetKeyValueArgs = {
  key: string;
  value: string;
  replace?: boolean;
}

export type OnSearchArgs = {
  query: string;
  keyValues: KeyValues;
  searchTerms: SearchTerms;
}

export type OnSearchCallback<T> = (args: OnSearchArgs) => ({
  abortSignal?: (abortSignal: AbortSignal) => PromiseLike<T>;
} & PromiseLike<T>)
export type OnCompletedCallback<T> = (args: {
  result: T;
} & OnSearchArgs) => void
export type OnSearchSynchronousCallback = (args: OnSearchArgs) => void

export type KeyValueSearchProviderProps<T> = {
  onSearch?: OnSearchCallback<T>;
  onCompleted?: OnCompletedCallback<T>;
  onSearchSynchronous?: OnSearchSynchronousCallback;
  onQueryChange?: () => void;
  isResultAbortError: (result: T) => boolean;
  automaticSearch?: boolean;
  kvRef?: Ref<KeyValueSearchContextProviderRef>;
} & PropsWithChildren<React.HTMLProps<HTMLDivElement>>

// Example
// For the query like this:
// label:blue label:orange user-name:"John Doe"
// Filters would look like this:
// filters: {
//   'label': ['blue', 'orange'],
//   'user-name': ['John Doe']
// },
export type KeyValues = {
  [key: string]: string[];
}
type SearchTerms = string[]

// A ref to be able to call the triggerSearch function manu
export type KeyValueSearchContextProviderRef = {
  triggerSearch: () => Promise<void>;
}

// Wraps the table and the search bar, so that they can share state
export const KeyValueSearchContextProvider = <T extends object>({
  onSearch,
  onCompleted,
  onSearchSynchronous,
  onQueryChange,
  isResultAbortError,
  children,
  automaticSearch = true,
  kvRef,
}: KeyValueSearchProviderProps<T>) => {
  if (onSearchSynchronous && (onSearch || onCompleted)) {
    throw new Error('Cannot use onSearchSynchronous with onSearch or onCompleted')
  }

  // Internal
  const [keyValues, setKeyValues] = useState<KeyValues>({})
  const [searchTerms, setSearchTerms] = useState<SearchTerms>([])

  // Exposed
  const [query, setQuery] = useState('')

  // Abortable search.
  const abortController = useRef<AbortController | null>(null)

  useImperativeHandle(kvRef, () => ({
    triggerSearch,
  }))

  const abortableOnSearch = useCallback(async (args: Omit<OnSearchArgs, 'abortSignal'>) => {
    if (!onSearch) return
    if (abortController.current) {
      abortController.current.abort()
    }
    const newAbortController = new AbortController()
    abortController.current = newAbortController
    let promise = onSearch(args)
    if (promise) {
      if (promise.abortSignal) {
        promise = promise.abortSignal(newAbortController.signal)
      }
      const res = await promise
      if (isResultAbortError(res)) {
        // Abort error
        return
      }
      if (onCompleted) {
        onCompleted({
          ...args,
          result: res,
        })
      }
    }
  }, [onSearch, onCompleted, isResultAbortError])

  const updateKeyValues = useCallback(() => {
    const {
      keyValues: extractedKeyValues,
      searchTerms: extractedSearchTerms,
    } = queryToObjects(query)

    // When the query updates, run the function that refetches the table data
    if (automaticSearch) {
      if (onSearchSynchronous) {
        onSearchSynchronous({
          query,
          keyValues: extractedKeyValues,
          searchTerms: extractedSearchTerms,
        })
      } else {
        abortableOnSearch({
          query,
          keyValues: extractedKeyValues,
          searchTerms: extractedSearchTerms,
        })
      }
    }
    setKeyValues(extractedKeyValues)
    setSearchTerms(extractedSearchTerms)
  }, [query, automaticSearch, onSearchSynchronous, abortableOnSearch])

  useEffect(() => {
    updateKeyValues()
  }, [query])

  // This is passed to the search icon you can click on to manually run the search
  async function triggerSearch() {
    if (onSearchSynchronous) {
      onSearchSynchronous({
        query,
        keyValues,
        searchTerms,
      })
      return
    }
    if (!onSearch) return
    const promise = onSearch({
      query,
      keyValues,
      searchTerms,
    })
    if (promise) {
      const res = await promise
      if (onCompleted) {
        onCompleted({
          query,
          keyValues,
          searchTerms,
          result: res,
        })
      }
    }
  }

  function setQueryWithCallback(newQuery: string) {
    if (onQueryChange) {
      onQueryChange()
    }
    setQuery(newQuery)
  }

  function setKeyValue({ key, value, replace = true }: SetKeyValueArgs) {
    const updatedFilters = structuredClone(keyValues)
    // If the key/value is already present, toggle it off.
    if (keyValues[key]?.includes(value)) {
      updatedFilters[key] = updatedFilters[key].filter((f) => f !== value)
      return setQueryWithCallback(objectsToQuery({ keyValues: updatedFilters, searchTerms }))
    }
    // If the key is already present, replace it.
    if (replace) {
      updatedFilters[key] = [value]
      return setQueryWithCallback(objectsToQuery({ keyValues: updatedFilters, searchTerms }))
    }
    // Otherwise, add it to the existing key/values.
    updatedFilters[key] = [...(updatedFilters[key] || []), value]
    return setQueryWithCallback(objectsToQuery({ keyValues: updatedFilters, searchTerms }))
  }

  function clearKeyValues() {
    return setQueryWithCallback(objectsToQuery({ keyValues: {}, searchTerms }))
  }

  return (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
    <KeyValueSearchContext.Provider value={{
      query,
      setQuery: setQueryWithCallback,
      keyValues,
      searchTerms,
      setKeyValue,
      clearKeyValues,
      triggerSearch,
      automaticSearch,
    }}
    >
      {children}
    </KeyValueSearchContext.Provider>
  )
}

function objectsToQuery({
  keyValues, searchTerms,
}: { keyValues: KeyValues; searchTerms: SearchTerms }) {
  // Remove empty values.
  const processedKeyValues = Object.fromEntries(
    Object.entries(keyValues).filter(([, value]) => value.length > 0),
  )
  return (`${keyValuesToString(processedKeyValues)} ${searchTerms.join(' ')}`).trim()
}

function keyValuesToString(keyValues: KeyValues) {
  let keyValuesString = ''
  // Loop through the keys of the keyValues object
  for (const key of Object.keys(keyValues)) {
    // Loop through the values of each key.
    for (const value of keyValues[key]) {
      if (value.includes(' ')) {
        // If a value contains spaces, wrap it in quotes
        keyValuesString += `${key}:"${value}"`
      } else {
        keyValuesString += `${key}:${value}`
      }
      keyValuesString += ' '
    }
  }
  return keyValuesString.trim()
}

function queryToObjects(query: string) {
  const { quotedTerms, modifiedQuery } = extractQuotedTerms(query)
  const { keyValues, searchTerms } = extractFilters(modifiedQuery)
  return {
    keyValues,
    searchTerms: [...quotedTerms, ...searchTerms],
  }
}

function extractFilters(query:string) {
  const keyValues: KeyValues = {}
  // Match a key/value-type (possibly containing hyphens)
  // followed by a colon and then either a word or a quoted string
  const regex = /([\w-]+):(".*?"|[\w-]+)/g

  let match = regex.exec(query)
  while (match !== null) {
    const key = match[1]
    // Remove quotes from value if present
    const values = match[2].replace(/^"|"$/g, '')

    // If key already exists, append to it. Otherwise, create a new array.
    if (keyValues[key]) {
      keyValues[key].push(values)
    } else {
      keyValues[key] = [values]
    }

    match = regex.exec(query)
  }

  // Remove the matched key/values from the query
  const modifiedQuery = query.replace(regex, '').trim()

  // Split the remaining query by spaces to get the search terms
  const searchTerms = modifiedQuery.split(/\s+/)

  return { keyValues, searchTerms }
}

function extractQuotedTerms(query:string) {
  const quotedTerms = []
  // Match either the start of the string or a non-capturing group of a space or start of the line,
  // followed by a quote and the quoted content
  const regex = /(?:^|\s)"([^"]*)"/g

  let match = regex.exec(query)
  while (match !== null) {
    quotedTerms.push(match[1])
    match = regex.exec(query)
  }

  // Remove the matched quoted terms from the query
  const modifiedQuery = query.replace(regex, '').trim()

  return { quotedTerms, modifiedQuery }
}
