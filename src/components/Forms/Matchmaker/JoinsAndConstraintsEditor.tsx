/*************************************************************************/
/*  JoinsAndConstraintsEditor.tsx                                        */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Form from '@webapps-common/UI/Form/Form'
import Button from '@webapps-common/UI/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import useHasMounted from '@webapps-common/hooks/useHasMounted'
import cn from '@webapps-common/utils/classNamesMerge'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useFormGroup } from '@webapps-common/UI/Form/FormGroup'
import withSchema from 'src/utils/withSchema'

type JoinsAndConstraintsEditorProps = {
  name: string;
  defaultValue: string;
  isInvalid?: boolean;
  setFieldValue: (
    field: string,
    value: string,
    shouldValidate?: boolean | undefined
  ) => void;
}

type Constraint = {
  id: string;
  table: string;
  column: string;
  operator: string;
  value: string | number[];
}

type TableData = {
  schema: string;
  name: string;
  columns: string[];
  user_id?: string;
}

export default function JoinsAndConstraintsEditor({
  name,
  defaultValue,
  isInvalid,
  setFieldValue,
}: JoinsAndConstraintsEditorProps) {
  const initialConstraints = defaultValueToState(defaultValue)
  const [constraints, setConstraints] = useState(initialConstraints)

  // Enables the form group to display the error message
  const { setIsInvalid } = useFormGroup()
  useEffect(() => {
    if (isInvalid !== undefined) {
      setIsInvalid(isInvalid)
    }
  }, [isInvalid, setIsInvalid])

  // Data fetched from supabase to autofill the table and column dropdowns
  const [tableData, setTableData] = useState<TableData[]>([])

  const supabase = useSupabaseClient()
  // Fetch tables (and their columns) from supabase
  useEffect(() => {
    const fetchTables = async () => {
      const res = await withSchema(supabase, 'w4online').rpc(
        'matchmaker_list_tables_as_constraints',
      )
      if (res.error) {
        toast.error(
          `Could not fetch tables: ${res.error?.message}`,
        )
        return
      }

      // Remove the user_id and id columns from the lists of columns
      // eslint-disable-next-line no-restricted-syntax
      for (const table of res.data) {
        table.columns = table.columns.filter(
          (c: string) => ![table.user_id, 'id'].includes(c),
        )
      }
      const ticketTable = {
        schema: 'w4online',
        name: 'ticket',
        columns: [],
      }
      const allTables = [ticketTable, ...res.data]
      setTableData(allTables)
    }
    fetchTables()
  }, [])

  useEffect(() => {
    const joinsFinalJson: {
      [key: string]: { schema: string; table: string; column: string };
    } = {}
    const constraintsFinalJson: {
      [key: string]: { value: string | number | number[]; op: string };
    } = {}
    // eslint-disable-next-line no-restricted-syntax
    for (const constraint of constraints) {
      // Set the value based on the operator
      let value: string | number | number[]
      if (constraint.operator === 'between') {
        value = constraint.value as number[]
      } else if (Number.isNaN(parseFloat(constraint.value as string))) {
        value = constraint.value as string
      } else {
        value = parseFloat(constraint.value as string)
      }
      constraintsFinalJson[`${constraint.table}.${constraint.column}`] = {
        value,
        op: constraint.operator,
      }
      // eslint-disable-next-line no-continue
      if (constraint.table === 'ticket') continue
      joinsFinalJson[`${constraint.table}`] = {
        schema: 'public',
        table: constraint.table,
        column:
          tableData.find((t) => t.name === constraint.table)?.user_id || '',
      }
    }
    const finalJson = {
      joins: joinsFinalJson,
      constraints: constraintsFinalJson,
    }
    setFieldValue(name, JSON.stringify(finalJson))
  }, [constraints])
  return (
    <div
      className={cn(
        '',
        isInvalid && 'border border-danger-500 p-1 rounded-md',
      )}
    >
      <Form.Label>Constraints</Form.Label>
      {constraints.map((constraint: Constraint) => (
        <ConstraintForm
          key={constraint.id}
          setConstraints={setConstraints}
          constraint={constraint}
          tableData={tableData}
        />
      ))}
      <ConstraintForm setConstraints={setConstraints} tableData={tableData} />
    </div>
  )
}

type ConstraintFormProps = {
  constraint?: Constraint;
  setConstraints: (updateFn: (prev: Constraint[]) => Constraint[]) => void;
  tableData?: TableData[];
}

function ConstraintForm({
  constraint,
  setConstraints,
  tableData,
}: ConstraintFormProps) {
  const [table, setTable] = useState(constraint?.table || '')
  const [column, setColumn] = useState(constraint?.column || '')
  const [operator, setOperator] = useState(constraint?.operator || '')
  const [value, setValue] = useState<string | number[]>(constraint?.value || '')
  const hasMounted = useHasMounted()
  // Data for the tables dropdown
  const [tables, setTables] = useState<string[]>([])
  const [columns, setColumns] = useState<string[]>([])

  // As soon as the table data is fetched, add the tables to the dropdown
  useEffect(() => {
    if (!tableData) return
    setTables(tableData.map((t: TableData) => t.name))
  }, [tableData])

  // When the user selects a table, add its columns to the columns dropdown
  useEffect(() => {
    if (!tableData) return
    const tableColumns = tableData.find((t: TableData) => t.name === table)
      ?.columns
    if (tableColumns) setColumns(tableColumns)
  }, [table, tableData])

  // Update state as the user modifies the inputs
  useEffect(() => {
    if (!constraint) return
    setConstraints((prev: Constraint[]) => prev.map((c) => {
      if (c.id === constraint.id) {
        return {
          id: constraint.id,
          table,
          column,
          operator,
          value,
        }
      }
      return c
    }))
  }, [table, column, operator, value])

  // Reset value when changing the operator
  useEffect(() => {
    // It also runs on the first render, so we need to check if the component has mounted first
    if (!hasMounted) return
    if (operator === 'between') {
      setValue([0, 0])
    } else {
      setValue('')
    }
  }, [operator])
  function addConstraint() {
    setConstraints((prev: Constraint[]) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        table,
        column,
        operator,
        value,
      },
    ])
    setTable('')
    setColumn('')
    setOperator('')
    setValue('')
  }

  function removeConstraint() {
    setConstraints((prev: Constraint[]) => prev.filter((c) => c.id !== constraint?.id))
  }
  return (
    <div className="mt-1 flex gap-1 test-sm justify-stretch">
      <div className="w-1/4 flex-grow-0 flex-shrink-0">
        <Form.Select
          name="table"
          value={table}
          placeholder="Table..."
          items={[
            { name: 'Ticket Data', value: 'ticket' },
            { name: 'Database tables:', type: 'header' },
            ...tables.slice(1).map((t) => ({ name: t, value: t, depth: 3 })),
          ]}
          onChange={(e) => {
            setTable(e.target.value as string)
            setColumn('')
          }}
        />
      </div>
      <div className="w-1/4 flex-grow-0 flex-shrink-0 flex">
        {table === 'ticket' ? (
          <Form.Input
            name="column"
            value={column}
            placeholder="Column..."
            onChange={(e) => setColumn(e.target.value as string)}
          />
        ) : (
          <Form.Select
            name="column"
            value={column}
            placeholder="Column..."
            items={columns.map((c) => ({ name: c, value: c }))}
            onChange={(e) => setColumn(e.target.value as string)}
          />
        )}
      </div>
      <Form.Select
        name="operator"
        value={operator}
        placeholder="Operator..."
        items={OPERATORS}
        onChange={(e) => {
          setOperator(e.target.value as string)
        }}
        className="text-sm"
      />
      <div className="flex gap-1 w-full">
        {operator === 'between' ? (
          <>
            <Form.Input
              placeholder="Min..."
              value={value[0] || 0}
              type="number"
              onChange={(e) => {
                setValue([
                  parseInt(e.target.value, 10) || 0,
                  (value[1] as number) || 0,
                ])
              }}
            />
            <Form.Input
              placeholder="Max..."
              value={value[1] || 0}
              type="number"
              onChange={(e) => {
                setValue([
                  (value[0] as number) || 0,
                  parseInt(e.target.value, 10) || 0,
                ])
              }}
            />
          </>
        ) : (
          <Form.Input
            placeholder="Value..."
            type={
              ['>', '<', '>=', '<='].includes(operator) ? 'number' : undefined
            }
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
      </div>
      {constraint ? (
        <Button onClick={() => removeConstraint()}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
      ) : (
        <Button
          onClick={() => addConstraint()}
          disabled={!(table && column && operator && value)}
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      )}
    </div>
  )
}

function defaultValueToState(defaultValue: string) {
  let initialConstraints: Constraint[] = []

  if (!defaultValue) return initialConstraints

  const parsedValue = JSON.parse(defaultValue)

  if (parsedValue.constraints) {
    initialConstraints = Object.keys(parsedValue.constraints).map((key) => ({
      id: crypto.randomUUID(),
      key,
      operator: parsedValue.constraints[key].op,
      value: parsedValue.constraints[key].value,
      table: key.split('.')[0],
      column: key.split('.')[1],
    }))
  }

  return initialConstraints
}

const OPERATORS = [
  {
    name: 'Equal to',
    value: '=',
  },
  {
    name: 'Not equal to',
    value: '<>',
  },
  {
    name: 'Greater than',
    value: '>',
  },
  {
    name: 'Greater or equal',
    value: '>=',
  },
  {
    name: 'Less than',
    value: '<',
  },
  {
    name: 'Less or equal',
    value: '<=',
  },
  {
    name: 'In range',
    value: 'between',
  },
]
