'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

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

interface AddTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (tableName: string, fields: Array<{ name: string; type: string; isPrimary?: boolean }>) => void
}

const DATA_TYPES = [
  'INTEGER',
  'TEXT',
  'VARCHAR',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'FLOAT',
  'DOUBLE',
]

export function AddTableDialog({ open, onOpenChange, onAdd }: AddTableDialogProps) {
  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState([{ name: '', type: 'INTEGER', isPrimary: false }])

  const handleAddField = () => {
    setFields([...fields, { name: '', type: 'INTEGER', isPrimary: false }])
  }

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: { name?: string; type?: string; isPrimary?: boolean }) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...field }
    setFields(newFields)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tableName && fields.every(f => f.name && f.type)) {
      onAdd(tableName, fields)
      setTableName('')
      setFields([{ name: '', type: 'INTEGER', isPrimary: false }])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name"
            />
          </div>
          <div className="grid gap-4">
            <Label>Fields</Label>
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, { name: e.target.value })}
                  placeholder="Field name"
                  className="flex-1"
                />
                <Select
                  value={field.type}
                  onValueChange={(value) => handleFieldChange(index, { type: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`primary-${index}`}
                    checked={field.isPrimary}
                    onCheckedChange={(checked) => 
                      handleFieldChange(index, { isPrimary: checked as boolean })
                    }
                  />
                  <Label htmlFor={`primary-${index}`}>PK</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveField(index)}
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
          <Button type="submit">Create Table</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

