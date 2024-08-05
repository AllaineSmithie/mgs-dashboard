/*************************************************************************/
/*  Form.tsx                                                             */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import type { FormHTMLAttributes, PropsWithChildren } from 'react'
import cn from '../../utils/classNamesMerge'
import FormGroup, { useFormGroup } from './FormGroup'
import FormCheckbox from './FormCheckbox'
import FormToggle from './FormToggle'
import FormSelect from './FormSelect'
import FormSelectMultiple from './FormSelectMultiple'
import FormFileInput from './FormFileInput'
import FormFeedback from './FormFeedback'
import { FormInput, FormTextarea } from './FormControl'
import FormInputText from './FormInputText'
import FormSeparator from './FormSeparator'
// eslint-disable-next-line import/no-cycle
import FormKeyValueEditor from './FormKeyValueEditor'

export type FormProps = {
  className?: string;
} & PropsWithChildren & FormHTMLAttributes<HTMLFormElement>

function FormRoot({
  children,
  className,
  ...props
}: FormProps) {
  return (
    <form
      className={cn('tw-w-full', className)}
      {...props}
    >
      {children}
    </form>
  )
}

type LabelProps = {
  className?: string;
} & PropsWithChildren

function Label({ children, className }: LabelProps) {
  const { controlId } = useFormGroup()
  return (
    <label
      className={cn('tw-block tw-text-sm tw-font-medium', className)}
      htmlFor={controlId}
    >
      {children}
    </label>
  )
}

type TextProps = {
  className?: string;
} & PropsWithChildren

function Text({ children, className }: TextProps) {
  return (
    <div
      className={cn(
        'tw-text-sm tw-text-foreground-muted',
        className,
      )}
    >
      {children}
    </div>
  )
}

const Form = Object.assign(FormRoot, {
  Group: FormGroup,
  Input: FormInput,
  InputText: FormInputText,
  Textarea: FormTextarea,
  Checkbox: FormCheckbox,
  Toggle: FormToggle,
  Feedback: FormFeedback,
  Label,
  Text,
  Select: FormSelect,
  SelectMultiple: FormSelectMultiple,
  KeyValueEditor: FormKeyValueEditor,
  Separator: FormSeparator,
  FileInput: FormFileInput,
})

export default Form
