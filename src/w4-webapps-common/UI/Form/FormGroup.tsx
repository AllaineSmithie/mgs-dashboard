/*************************************************************************/
/*  FormGroup.tsx                                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { PropsWithChildren } from 'react'
import { useState, createContext, useContext } from 'react'
import cn from '../../utils/classNamesMerge'

// Create context to hold the validation state of the Control inside the Group.
type FormGroupContextType = {
  controlId?: string;
  isInvalid: boolean;
  setIsInvalid: (value: boolean) => void;
}
const FormGroupContext = createContext<FormGroupContextType | undefined>(
  undefined,
)

export const useFormGroup = (): FormGroupContextType => {
  const context = useContext(FormGroupContext)
  if (context === undefined) {
    // Optionally we could decide to throw the error if the component is used outside of a FormGroup
    // throw new Error('useFormGroup must be used within a FormGroup')
    return { controlId: '', isInvalid: false, setIsInvalid: () => {} }
  }
  return context
}

type GroupProps = {
  controlId?: string;
  className?: string;
} & PropsWithChildren

export default function FormGroup({
  controlId,
  children,
  className,
}: GroupProps) {
  const [isInvalid, setIsInvalid] = useState(false)
  return (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
    <FormGroupContext.Provider value={{ controlId, isInvalid, setIsInvalid }}>
      <div
        className={cn(
          'mt-3 first:mt-0 flex flex-col gap-1',
          className,
        )}
      >
        {children}
      </div>
    </FormGroupContext.Provider>
  )
}
