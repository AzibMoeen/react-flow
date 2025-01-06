'use client'

import { useCallback, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow'
import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'

const RELATION_SYMBOLS = {
  'one-to-one': '1:1',
  'one-to-many': '1:N',
  'many-to-one': 'N:1',
  'many-to-many': 'N:N',
}

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const [relationType, setRelationType] = useState<RelationType>(data?.relationType || 'one-to-many')

  const onTypeChange = useCallback((type: RelationType) => {
    setRelationType(type)
    if (data?.onTypeChange) {
      data.onTypeChange(id, type)
    }
  }, [id, data])

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-6 px-2 py-1 text-xs font-medium bg-background/60 backdrop-blur-sm"
              >
                {RELATION_SYMBOLS[relationType]}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => onTypeChange('one-to-one')}>
                One-to-One (1:1)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTypeChange('one-to-many')}>
                One-to-Many (1:N)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTypeChange('many-to-one')}>
                Many-to-One (N:1)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTypeChange('many-to-many')}>
                Many-to-Many (N:N)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

