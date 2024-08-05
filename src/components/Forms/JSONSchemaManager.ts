import Ajv from 'ajv'

const JSONSchemas = {
  'fleet-labels': {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Fleet - Labels',
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: {
      type: 'string',
      pattern: '^(([a-zA-Z0-9][-A-Za-z0-9_.]{0,61}[a-zA-Z0-9])|[a-zA-Z0-9]|)$',
    },
  },
  'matchmaking-profile-query': {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Matchmaker Profile - Query',
    type: 'object',
    properties: {
      joins: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            schema: {
              type: 'string',
            },
            table: {
              type: 'string',
            },
            column: {
              type: 'string',
            },
          },
          required: ['schema', 'table', 'column'],
        },
      },
      constraints: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            // Equals operator
            {
              type: 'object',
              properties: {
                op: {
                  type: 'string',
                  enum: ['='],
                },
                value: {
                  anyOf: [
                    { type: 'number' },
                    { type: 'string' },
                  ],
                },
              },
              required: ['op', 'value'],
            },
            // Between operator
            {
              type: 'object',
              properties: {
                op: {
                  type: 'string',
                  enum: ['BETWEEN', 'between'],
                },
                value: {
                  type: 'array',
                  minItems: 2,
                  maxItems: 2,
                  items: { type: 'number' },
                },
              },
              required: ['op', 'value'],
            },
            // Comparison operators
            {
              type: 'object',
              properties: {
                op: {
                  type: 'string',
                  enum: ['>', '>=', '<', '<=', '<>'],
                },
                value: { type: 'number' },
              },
              required: ['op', 'value'],
            },
          ],
        },
      },
    },
    required: ['constraints'],
  },
  'matchmaking-profile-lobby_props': {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Lobby - Properties',
    type: 'object',
    properties: {
      gameServerSelectors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            matchLabels: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    additionalProperties: {
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
        {
          type: 'array',
          items: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'number',
              },
            ],
          },
        },
      ],
    },
  },
}
export type JSONSchemaID = keyof typeof JSONSchemas

const JSONManager = (function JSONManager() {
  const ajv = new Ajv()
  const validators = Object.fromEntries(Object.entries(JSONSchemas).map(
    ([key, value]) => [key, ajv.compile(value)],
  ))

  return {
    validators,

    getMonacoSchemas() {
      return Object.entries(JSONSchemas).map(([key, value]) => (
        {
          uri: key,
          fileMatch: [`*.${key}.json`],
          schema: value,
        }
      ))
    },

    getMonacoModelPath(uniqueId : string, schemaId : JSONSchemaID) {
      if (!(schemaId in JSONSchemas)) {
        throw new Error(`Invalid schema ID: ${String(schemaId)}`)
      }
      return `${String(uniqueId)}.${schemaId}.json`
    },
  }
}())

export default JSONManager
