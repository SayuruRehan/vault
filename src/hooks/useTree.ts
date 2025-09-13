import { useState, useEffect, useCallback } from 'react'
import { TreeNode, FlatNode, ApiResponse } from '@/types'

// Convert flat nodes to tree structure
function buildTree(flatNodes: FlatNode[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  // First pass: create all nodes
  flatNodes.forEach(node => {
    nodeMap.set(node.id, {
      ...node,
      children: [],
    })
  })

  // Second pass: build hierarchy
  flatNodes.forEach(node => {
    const treeNode = nodeMap.get(node.id)!
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId)
      if (parent) {
        parent.children!.push(treeNode)
      }
    } else {
      roots.push(treeNode)
    }
  })

  // Sort children by orderKey
  const sortByOrderKey = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.orderKey.localeCompare(b.orderKey))
    nodes.forEach(node => {
      if (node.children) {
        sortByOrderKey(node.children)
      }
    })
  }

  sortByOrderKey(roots)
  return roots
}

export function useTree() {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [flatNodes, setFlatNodes] = useState<FlatNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/tree')
      const data: ApiResponse<FlatNode[]> = await response.json()

      if (data.success && data.data) {
        setFlatNodes(data.data)
        setTree(buildTree(data.data))
      } else {
        setError(data.error || 'Failed to fetch tree')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to fetch tree:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentId }),
      })

      const data: ApiResponse<FlatNode> = await response.json()

      if (data.success && data.data) {
        // Update local state
        const newNode = data.data
        setFlatNodes(prev => [...prev, newNode])
        setTree(buildTree([...flatNodes, newNode]))
        return newNode
      } else {
        throw new Error(data.error || 'Failed to create folder')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create folder'
      setError(message)
      throw err
    }
  }, [flatNodes])

  const createDocument = useCallback(async (title: string, parentId?: string) => {
    try {
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, parentId }),
      })

      const data: ApiResponse<FlatNode> = await response.json()

      if (data.success && data.data) {
        // Update local state
        const newNode = data.data
        setFlatNodes(prev => [...prev, newNode])
        setTree(buildTree([...flatNodes, newNode]))
        return newNode
      } else {
        throw new Error(data.error || 'Failed to create document')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create document'
      setError(message)
      throw err
    }
  }, [flatNodes])

  const renameNode = useCallback(async (nodeId: string, newName: string) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      const data: ApiResponse<FlatNode> = await response.json()

      if (data.success && data.data) {
        // Update local state
        const updatedNode = data.data
        setFlatNodes(prev => 
          prev.map(node => node.id === nodeId ? updatedNode : node)
        )
        setTree(buildTree(flatNodes.map(node => 
          node.id === nodeId ? updatedNode : node
        )))
        return updatedNode
      } else {
        throw new Error(data.error || 'Failed to rename node')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rename node'
      setError(message)
      throw err
    }
  }, [flatNodes])

  const deleteNode = useCallback(async (nodeId: string, recursive = false) => {
    try {
      const url = `/api/nodes/${nodeId}${recursive ? '?recursive=true' : ''}`
      const response = await fetch(url, {
        method: 'DELETE',
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        // Update local state by removing the node and its descendants
        const removeNodeAndDescendants = (nodes: FlatNode[], targetId: string): FlatNode[] => {
          const toRemove = new Set<string>()
          
          // Find all descendants
          const findDescendants = (parentId: string) => {
            nodes.forEach(node => {
              if (node.parentId === parentId) {
                toRemove.add(node.id)
                findDescendants(node.id)
              }
            })
          }
          
          toRemove.add(targetId)
          findDescendants(targetId)
          
          return nodes.filter(node => !toRemove.has(node.id))
        }

        const updatedNodes = removeNodeAndDescendants(flatNodes, nodeId)
        setFlatNodes(updatedNodes)
        setTree(buildTree(updatedNodes))
      } else {
        throw new Error(data.error || 'Failed to delete node')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete node'
      setError(message)
      throw err
    }
  }, [flatNodes])

  const moveNode = useCallback(async (
    nodeId: string, 
    newParentId?: string, 
    beforeNodeId?: string, 
    afterNodeId?: string
  ) => {
    try {
      const response = await fetch(`/api/nodes/${nodeId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newParentId, beforeNodeId, afterNodeId }),
      })

      const data: ApiResponse<FlatNode> = await response.json()

      if (data.success && data.data) {
        // Update local state
        const updatedNode = data.data
        setFlatNodes(prev => 
          prev.map(node => node.id === nodeId ? updatedNode : node)
        )
        setTree(buildTree(flatNodes.map(node => 
          node.id === nodeId ? updatedNode : node
        )))
        return updatedNode
      } else {
        throw new Error(data.error || 'Failed to move node')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move node'
      setError(message)
      throw err
    }
  }, [flatNodes])

  // Load tree on mount
  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  return {
    tree,
    flatNodes,
    loading,
    error,
    refresh: fetchTree,
    createFolder,
    createDocument,
    renameNode,
    deleteNode,
    moveNode,
  }
}