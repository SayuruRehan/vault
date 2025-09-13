import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required and must be a string',
        },
        { status: 400 }
      )
    }

    const node = await prisma.node.update({
      where: { id: id as string },
      data: {
        name: name.trim(),
      },
      include: {
        doc: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: node,
    })
  } catch (error) {
    console.error('Failed to update node:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update node',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  try {
    // Check if the node exists
    const node = await prisma.node.findUnique({
      where: { id: id as string },
      include: {
        children: true,
      },
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

    // If it's a folder with children, check for recursive delete permission
    if (node.type === 'FOLDER' && node.children.length > 0) {
      const url = new URL(request.url)
      const recursive = url.searchParams.get('recursive') === 'true'

      if (!recursive) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete folder with children. Use recursive=true to force delete.',
          },
          { status: 400 }
        )
      }
    }

    // Delete the node (cascading will handle children and documents)
    await prisma.node.delete({
      where: { id: id as string },
    })

    return NextResponse.json({
      success: true,
      data: { id },
    })
  } catch (error) {
    console.error('Failed to delete node:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete node',
      },
      { status: 500 }
    )
  }
}