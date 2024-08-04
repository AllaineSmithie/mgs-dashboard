/*************************************************************************/
/*  JSONSchemaManager.ts                                                 */
/*************************************************************************/
/* Copyright W4 Games Limited                                            */
/* SPDX-License-Identifier: AGPL-3.0-only                                */
/*************************************************************************/

import Ajv, { ValidateFunction } from 'ajv'

export type JSONSchema = {
  $schema?: string;
  title?: string;
  type?: 'object' | 'string' | 'number' | 'array' | 'boolean';
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean | Record<string, unknown>;
}

// To pass JSONManager as props to a JSONFormInput/JSONEditor, we need this type:
export type JSONManagerType = {
  validators: Record<string, ValidateFunction>;
  getMonacoSchemas: () => Array<{
    uri: string;
    fileMatch: string[];
    schema: JSONSchema;
  }>;
  getMonacoModelPath: (uniqueId: string, schemaId: JSONSchemaID) => string;
}

export type JSONSchemaID = string

function createJSONManager(schemas: Record<string, JSONSchema>): JSONManagerType {
  const ajv = new Ajv()
  const validators = Object.fromEntries(Object.entries(schemas).map(
    ([key, value]) => [key, ajv.compile(value)],
  ))

  return {
    validators,

    getMonacoSchemas() {
      return Object.entries(schemas).map(([key, value]) => (
        {
          uri: key,
          fileMatch: [`*.${key}.json`],
          schema: value,
        }
      ))
    },

    getMonacoModelPath(uniqueId : string, schemaId : JSONSchemaID) {
      if (!(schemaId in schemas)) {
        throw new Error(`Invalid schema ID: ${String(schemaId)}`)
      }
      return `${String(uniqueId)}.${schemaId}.json`
    },
  }
}

export default createJSONManager
