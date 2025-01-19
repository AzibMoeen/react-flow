'use client'

import { useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Key, Link2, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { EditTableDialog } from './edit-table-dialog'
import { Table, Field } from '../types/schema'

interface TableNodeProps extends NodeProps {
  data: Table & {
    onEdit: (tableId: string, updates: Partial<Table>) => void
    onDelete: (tableId: string) => void
  }
}

export function TableNode({ data, id }: TableNodeProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <Card className="min-w-[250px] shadow-lg border-2">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {data.name}
            <Badge variant="outline" className="text-xs">
              {data.fields.length} fields
            </Badge>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Table
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => data.onDelete(id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="grid gap-2">
          {data.fields.map((field: Field,index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                {field.isPrimary && (
                  <Key className="h-3 w-3 text-primary" />
                )}
                {field.isForeign && (
                  <Link2 className="h-3 w-3 text-blue-500" />
                )}
                <span className="font-medium">{field.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {field.type}
                </Badge>
                {field.isUnique && (
                  <Badge variant="outline" className="text-xs">
                    UNIQUE
                  </Badge>
                )}
                {field.isNullable && (
                  <Badge variant="outline" className="text-xs">
                    NULL
                  </Badge>
                )}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={`${field.id}-right`}
                className="w-3 h-3 bg-primary"
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`${field.id}-left`}
                className="w-3 h-3 bg-primary"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <EditTableDialog
        table={data}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={(updates) => {
          data.onEdit(id, updates)
          setShowEditDialog(false)
        }}
      />
    </>
  )
}

