import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  try {
    const node = await prisma.node.findUnique({
      where: {
        id: id as string,
      },
      include: {
        doc: true,
      },
    })

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document not found',
        },
        { status: 404 }
      )
    }

    if (node.type !== 'DOC') {
      return NextResponse.json(
        {
          success: false,
          error: 'Node is not a document',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: node,
    })
  } catch (error) {
    console.error('Failed to fetch document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch document',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  try {
    const body = await request.json()
    const { contentJson, plainText } = body

    if (!contentJson || !plainText) {
      return NextResponse.json(
        {
          success: false,
          error: 'contentJson and plainText are required',
        },
        { status: 400 }
      )
    }

    // Verify the node exists and is a document
    const node = await prisma.node.findUnique({
      where: { id: id as string },
      include: { doc: true },
    })

    if (!node) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document not found',
        },
        { status: 404 }
      )
    }

    if (node.type !== 'DOC') {
      return NextResponse.json(
        {
          success: false,
          error: 'Node is not a document',
        },
        { status: 400 }
      )
    }

    // Update the document
    const updatedDoc = await prisma.document.update({
      where: { nodeId: id as string },
      data: {
        contentJson: JSON.stringify(contentJson),
        plainText,
        lastSavedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...node,
        doc: updatedDoc,
      },
    })
  } catch (error) {
    console.error('Failed to update document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update document',
      },
      { status: 500 }
    )
  }
}