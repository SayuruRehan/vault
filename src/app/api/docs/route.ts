import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderKey } from '@/lib/ordering'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, parentId } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Title is required and must be a string',
        },
        { status: 400 }
      )
    }

    // Find siblings to determine order key
    const siblings = await prisma.node.findMany({
      where: {
        parentId: parentId || null,
      },
      orderBy: {
        orderKey: 'desc',
      },
      take: 1,
    })

    const lastOrderKey = siblings.length > 0 ? siblings[0].orderKey : undefined
    const orderKey = generateOrderKey(lastOrderKey)

    // Create node and document in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const node = await tx.node.create({
        data: {
          type: 'DOC',
          name: title.trim(),
          parentId: parentId || null,
          orderKey,
        },
      })

      const document = await tx.document.create({
        data: {
          nodeId: node.id,
          contentJson: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [],
              },
            ],
          }),
          plainText: '',
          lastSavedAt: new Date(),
        },
      })

      return { node, document }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...result.node,
        doc: result.document,
      },
    })
  } catch (error) {
    console.error('Failed to create document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create document',
      },
      { status: 500 }
    )
  }
}