import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderKey } from '@/lib/ordering'

// Helper function to check if moving a node would create a cycle
async function wouldCreateCycle(nodeId: string, newParentId: string): Promise<boolean> {
  if (nodeId === newParentId) return true
  
  let currentParentId: string | null = newParentId
  
  while (currentParentId) {
    if (currentParentId === nodeId) return true
    
    const parent = await prisma.node.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    })
    
    currentParentId = parent?.parentId || null
  }
  
  return false
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { newParentId, beforeNodeId, afterNodeId } = body

    // Validate that the node exists
    const node = await prisma.node.findUnique({
      where: { id: params.id },
    })

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: 'Node not found',
        },
        { status: 404 }
      )
    }

    // Check for cycle if moving to a different parent
    if (newParentId && newParentId !== node.parentId) {
      const cycleDetected = await wouldCreateCycle(params.id, newParentId)
      if (cycleDetected) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot move node: would create a cycle',
          },
          { status: 400 }
        )
      }
    }

    // Get siblings in the target location to determine order
    const targetParentId = newParentId || node.parentId
    let beforeOrderKey: string | undefined
    let afterOrderKey: string | undefined

    if (beforeNodeId) {
      const beforeNode = await prisma.node.findUnique({
        where: { id: beforeNodeId },
        select: { orderKey: true },
      })
      beforeOrderKey = beforeNode?.orderKey
    }

    if (afterNodeId) {
      const afterNode = await prisma.node.findUnique({
        where: { id: afterNodeId },
        select: { orderKey: true },
      })
      afterOrderKey = afterNode?.orderKey
    }

    // Generate new order key
    const newOrderKey = generateOrderKey(beforeOrderKey, afterOrderKey)

    // Update the node
    const updatedNode = await prisma.node.update({
      where: { id: params.id },
      data: {
        parentId: targetParentId,
        orderKey: newOrderKey,
      },
      include: {
        doc: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedNode,
    })
  } catch (error) {
    console.error('Failed to move node:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to move node',
      },
      { status: 500 }
    )
  }
}