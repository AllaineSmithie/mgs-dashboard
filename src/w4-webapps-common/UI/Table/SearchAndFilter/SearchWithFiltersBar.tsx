/*************************************************************************/
/*  SearchWithFiltersBar.tsx                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Form from '../../Form/Form'
import { useSearchAndFilterContext } from './SearchAndFilterContextProvider'

export default function SearchWithFiltersBar() {
  const { setQuery, query, onSearch } = useSearchAndFilterContext()

  return (
    <div className="tw-relative tw-flex tw-w-full">
      <Form.Input
        placeholder="Search and filter..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
        }}
      />
      <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-4 tw-flex tw-gap-1 tw-items-center">
        {query && (
          <button
            type="button"
            className="tw-flex tw-items-center tw-justify-center tw-h-7 tw-w-7 tw-rounded-full hover:tw-bg-surface-200 tw-text-sm tw-text-foreground-muted"
            onClick={() => setQuery('')}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
        <button
          type="button"
          className="tw-flex tw-items-center tw-justify-center tw-h-7 tw-w-7 tw-rounded-full hover:tw-bg-surface-200 tw-text-sm tw-text-foreground-muted"
          onClick={() => {
            if (onSearch) {
              onSearch(query)
            }
          }}
        >
          <FontAwesomeIcon icon={faSearch} className="tw-text-foreground-muted" />
        </button>
      </div>
    </div>
  )
}
