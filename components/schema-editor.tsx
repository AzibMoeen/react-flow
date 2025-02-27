'use client'

import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  MarkerType,
  EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Save, FileUp, Download, Code } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AddTableDialog } from './add-table-dialog'

import { Table,Relationship,Field,RelationType,createTable,createField } from '@/types/schema'
import { v4 as uuidv4 } from 'uuid'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RelationshipEdge } from './relationship-edge'
import { useToast } from '@/hooks/use-toast'
import { SQLCodeDialog } from './sql-code-dialog'
import { TableNode } from './table-node'


const nodeTypes = {
  table: TableNode,
}

const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
}

export default function SchemaEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showAddTable, setShowAddTable] = useState(false)
  const [sqlCode, setSqlCode] = useState('')
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const edge = {
        ...params,
        id: uuidv4(),
        type: 'relationship',
        animated: true,
        data: {
          relationType: 'one-to-many' as RelationType,
          onTypeChange: handleRelationshipTypeChange,
        },
        style: { stroke: 'hsl(var(--primary))' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      }
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges]
  )

  const handleRelationshipTypeChange = useCallback(
    (edgeId: string, type: RelationType) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  relationType: type,
                },
              }
            : edge
        )
      )
    },
    [setEdges]
  )

  const handleAddTable = useCallback(
    (tableName: string, fields: Field[]) => {
      const position = {
        x: Math.random() * 500,
        y: Math.random() * 500,
      }

      const newTable = createTable({
        name: tableName,
        fields,
        position,
      })

      const newNode: Node = {
        id: newTable.id,
        type: 'table',
        position,
        data: {
          ...newTable,
          onEdit: handleEditTable,
          onDelete: handleDeleteTable,
        },
      }

      setNodes((nds) => [...nds, newNode])
      setShowAddTable(false)
    },
    [setNodes]
  )

  const handleEditTable = useCallback(
    (tableId: string, updates: Partial<Table>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === tableId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                  onEdit: handleEditTable,
                  onDelete: handleDeleteTable,
                },
              }
            : node
        )
      )
    },
    [setNodes]
  )

  const handleDeleteTable = useCallback(
    (tableId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== tableId))
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== tableId && edge.target !== tableId
        )
      )
    },
    [setNodes, setEdges]
  )

  const handleSaveSchema = () => {
    const schema = {
      tables: nodes.map((node) => ({
        id: node.id,
        name: node.data.name,
        fields: node.data.fields,
        position: node.position,
      })),
      relationships: edges.map((edge) => ({
        id: edge.id,
        sourceTableId: edge.source,
        sourceFieldId: edge.sourceHandle?.split('-')[0],
        targetTableId: edge.target,
        targetFieldId: edge.targetHandle?.split('-')[0],
        type: edge.data?.relationType || 'one-to-many',
      })),
    }
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'schema.json'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Schema Saved",
      description: "Your database schema has been downloaded successfully.",
    })
  }

  const handleLoadSchema = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const schema = JSON.parse(event.target?.result as string)
        
        // Load nodes
        const newNodes = schema.tables.map((table: Table) => ({
          id: table.id,
          type: 'table',
          position: table.position,
          data: {
            ...table,
            onEdit: handleEditTable,
            onDelete: handleDeleteTable,
          },
        }))
        setNodes(newNodes)

        // Load edges with relationship types
        const newEdges = schema.relationships.map((rel: Relationship) => ({
          id: rel.id,
          source: rel.sourceTableId,
          target: rel.targetTableId,
          sourceHandle: `${rel.sourceFieldId}-right`,
          targetHandle: `${rel.targetFieldId}-left`,
          type: 'relationship',
          animated: true,
          data: {
            relationType: rel.type,
            onTypeChange: handleRelationshipTypeChange,
          },
          style: { stroke: 'hsl(var(--primary))' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))',
          },
        }))
        setEdges(newEdges)

        toast({
          title: "Schema Loaded",
          description: "Your database schema has been loaded successfully.",
        })
      } catch (error) {
        console.error('Error loading schema:', error)
        toast({
          title: "Error Loading Schema",
          description: "There was an error loading your schema. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateSQLCode = () => {
    let sql = ''

    // Create tables
    nodes.forEach((node) => {
      sql += `CREATE TABLE ${node.data.name} (\n`
      node.data.fields.forEach((field: Field, index: number) => {
        sql += `  ${field.name} ${field.type}`
        if (field.isPrimary) sql += ' PRIMARY KEY'
        if (field.isUnique) sql += ' UNIQUE'
        if (!field.isNullable) sql += ' NOT NULL'
        if (index < node.data.fields.length - 1) sql += ','
        sql += '\n'
      })
      sql += ');\n\n'
    })

    // Add foreign key constraints
    edges.forEach((edge) => {
      const sourceTable = nodes.find((node) => node.id === edge.source)
      const targetTable = nodes.find((node) => node.id === edge.target)
      const sourceField = sourceTable?.data.fields.find((f: Field) => f.id === edge.sourceHandle?.split('-')[0])
      const targetField = targetTable?.data.fields.find((f: Field) => f.id === edge.targetHandle?.split('-')[0])

      if (sourceTable && targetTable && sourceField && targetField) {
        sql += `ALTER TABLE ${sourceTable.data.name}\n`
        sql += `ADD CONSTRAINT fk_${sourceTable.data.name}_${targetTable.data.name}\n`
        sql += `  FOREIGN KEY (${sourceField.name})\n`
        sql += `  REFERENCES ${targetTable.data.name}(${targetField.name});\n\n`
      }
    })

    setSqlCode(sql)
    toast({
      title: "SQL Code Generated",
      description: "Your SQL code has been generated successfully.",
    })
  }

  return (
    <div className="w-full h-screen">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setShowAddTable(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Create a new table in the schema
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={handleSaveSchema}>
                <Save className="mr-2 h-4 w-4" />
                Save Schema
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Download the current schema as JSON
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" asChild>
                <label className="flex items-center cursor-pointer">
                  <FileUp className="mr-2 h-4 w-4" />
                  Load Schema
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleLoadSchema}
                  />
                </label>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Load a schema from a JSON file
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={generateSQLCode}>
                <Code className="mr-2 h-4 w-4" />
                Create SQL
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Generate SQL code from the current schema
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {sqlCode && <SQLCodeDialog sqlCode={sqlCode} />}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'relationship',
        }}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <AddTableDialog
        open={showAddTable}
        onOpenChange={setShowAddTable}
        onAdd={handleAddTable}
      />
    </div>
  )
}

