import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderKey } from '@/lib/ordering'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, parentId } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required and must be a string',
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

    const folder = await prisma.node.create({
      data: {
        type: 'FOLDER',
        name: name.trim(),
        parentId: parentId || null,
        orderKey,
      },
    })

    return NextResponse.json({
      success: true,
      data: folder,
    })
  } catch (error) {
    console.error('Failed to create folder:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create folder',
      },
      { status: 500 }
    )
  }
}