'use client'

import { useState } from 'react'
import { Plus, Trash2, Key, Link2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, Field, FieldType ,createField} from '../types/schema'

interface EditTableDialogProps {
  table: Table
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Table>) => void
}

const DATA_TYPES: FieldType[] = [
  'INTEGER',
  'TEXT',
  'VARCHAR',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'FLOAT',
  'DOUBLE',
]

export function EditTableDialog({
  table,
  open,
  onOpenChange,
  onSave,
}: EditTableDialogProps) {
  const [name, setName] = useState(table.name)
  const [fields, setFields] = useState<Field[]>(table.fields)

  const handleAddField = () => {
    setFields([...fields, createField()])
  }

  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId))
  }

  const handleFieldChange = (
    fieldId: string,
    updates: Partial<Field>
  ) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && fields.every((f) => f.name && f.type)) {
      onSave({ name, fields })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Table: {table.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter table name"
            />
          </div>
          <div className="grid gap-4">
            <Label>Fields</Label>
            {fields.map((field) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="grid gap-2 flex-1">
                  <Input
                    value={field.name}
                    onChange={(e) =>
                      handleFieldChange(field.id, { name: e.target.value })
                    }
                    placeholder="Field name"
                  />
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`primary-${field.id}`}
                        checked={field.isPrimary}
                        onCheckedChange={(checked) =>
                          handleFieldChange(field.id, {
                            isPrimary: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor={`primary-${field.id}`} className="flex items-center gap-1">
                        <Key className="h-3 w-3" /> Primary
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`foreign-${field.id}`}
                        checked={field.isForeign}
                        onCheckedChange={(checked) =>
                          handleFieldChange(field.id, {
                            isForeign: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor={`foreign-${field.id}`} className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> Foreign
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`unique-${field.id}`}
                        checked={field.isUnique}
                        onCheckedChange={(checked) =>
                          handleFieldChange(field.id, {
                            isUnique: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor={`unique-${field.id}`}>Unique</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`nullable-${field.id}`}
                        checked={field.isNullable}
                        onCheckedChange={(checked) =>
                          handleFieldChange(field.id, {
                            isNullable: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor={`nullable-${field.id}`}>Nullable</Label>
                    </div>
                  </div>
                </div>
                <Select
                  value={field.type}
                  onValueChange={(value: FieldType) =>
                    handleFieldChange(field.id, { type: value })
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map((type) => (
                      <SelectItem key={`${field.id}-${type}`} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={handleAddField}>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

