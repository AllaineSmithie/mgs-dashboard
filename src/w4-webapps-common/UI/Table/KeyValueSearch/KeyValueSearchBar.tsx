/*************************************************************************/
/*  KeyValueSearchBar.tsx                                                */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

/* eslint-disable react/jsx-no-bind */
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react'
import Form from '../../Form/Form'
import cn from '../../../utils/classNamesMerge'
import { useKeyValueSearchContext } from './KeyValueSearchContextProvider'

export type KeyValueSearchBarProps = {
  defaultQuery?: string;
}
export default function KeyValueSearchBar({
  defaultQuery,
} : KeyValueSearchBarProps) {
  const {
    setQuery,
    query,
    triggerSearch,
    automaticSearch,
  } = useKeyValueSearchContext()

  useEffect(() => {
    if (defaultQuery) {
      setQuery(defaultQuery)
    }
  }, [])

  return (
    <div className="relative w-full flex">
      <div className="absolute z-10 w-8 pl-1 inset-0 l-0 flex items-center justify-center">
        <button
          type="button"
          className={cn('rounded-full flex items-center justify-center p-1.5 hover:bg-surface-100 text-sm text-foreground-muted cursor-pointer', automaticSearch && 'cursor-default hover:bg-transparent')}
          onClick={triggerSearch}
        >
          <FontAwesomeIcon icon={faSearch} className="text-foreground-muted/50" />
        </button>
      </div>
      <Form.Input
        className="pl-8"
        placeholder="Search and filter..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
        }}
        onEnter={triggerSearch}
      />
      <div className="absolute inset-y-1 right-1 flex gap-1 items-center bg-control ">
        {query && (
          <button
            type="button"
            className="flex items-center justify-center h-7 w-7 rounded-full hover:bg-surface-200 text-sm text-foreground-muted"
            onClick={() => setQuery('')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  )
}
