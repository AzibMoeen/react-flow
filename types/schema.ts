export type FieldType = 'INTEGER' | 'TEXT' | 'VARCHAR' | 'BOOLEAN' | 'DATE' | 'TIMESTAMP' | 'FLOAT' | 'DOUBLE'

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'

export interface Field {
  id: string
  name: string
  type: FieldType
  isPrimary?: boolean
  isForeign?: boolean
  isUnique?: boolean
  isNullable?: boolean
  references?: {
    tableId: string
    fieldId: string
  }
}

export interface Table {
  id: string
  name: string
  fields: Field[]
  position: {
    x: number
    y: number
  }
}

export interface Relationship {
  id: string
  sourceTableId: string
  sourceFieldId: string
  targetTableId: string
  targetFieldId: string
  type: RelationType
}

