import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all nodes with their documents
    const nodes = await prisma.node.findMany({
      include: {
        doc: true,
      },
      orderBy: [
        { orderKey: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: nodes,
    })
  } catch (error) {
    console.error('Failed to fetch tree:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tree structure',
      },
      { status: 500 }
    )
  }
}