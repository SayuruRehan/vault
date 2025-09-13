/**
 * Utility functions for fractional indexing to maintain order
 * These functions generate lexicographically ordered strings
 */

const BASE = 'a'
const MID = 'm'

/**
 * Generate an order key between two existing keys
 */
export function generateOrderKey(before?: string, after?: string): string {
  if (!before && !after) {
    return BASE
  }
  
  if (!before) {
    return generateBefore(after!)
  }
  
  if (!after) {
    return generateAfter(before!)
  }
  
  return generateBetween(before, after)
}

function generateBefore(key: string): string {
  if (key === BASE) {
    return BASE + BASE
  }
  
  const lastChar = key[key.length - 1]
  if (lastChar > BASE) {
    const prevChar = String.fromCharCode(lastChar.charCodeAt(0) - 1)
    return key.slice(0, -1) + prevChar + MID
  }
  
  return key + BASE
}

function generateAfter(key: string): string {
  const lastChar = key[key.length - 1]
  if (lastChar < 'z') {
    const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1)
    return key.slice(0, -1) + nextChar
  }
  
  return key + BASE
}

function generateBetween(before: string, after: string): string {
  const minLen = Math.min(before.length, after.length)
  let i = 0
  
  // Find the first differing character
  while (i < minLen && before[i] === after[i]) {
    i++
  }
  
  if (i === minLen) {
    // One string is a prefix of the other
    if (before.length < after.length) {
      return before + MID
    } else {
      return after + MID
    }
  }
  
  const beforeChar = before.charCodeAt(i)
  const afterChar = after.charCodeAt(i)
  
  if (afterChar - beforeChar > 1) {
    // There's room for a character between them
    const midChar = String.fromCharCode(Math.floor((beforeChar + afterChar) / 2))
    return before.slice(0, i) + midChar
  }
  
  // Characters are adjacent, need to go deeper
  return before.slice(0, i + 1) + MID
}

/**
 * Generate the first order key (for root elements)
 */
export function getFirstOrderKey(): string {
  return BASE
}

/**
 * Move an item to a new position in the order
 */
export function reorderItems<T extends { id: string; orderKey: string }>(
  items: T[],
  itemId: string,
  beforeId?: string,
  afterId?: string
): { newOrderKey: string; reorderedItems: T[] } {
  const item = items.find(i => i.id === itemId)
  if (!item) {
    throw new Error('Item not found')
  }
  
  // Remove the item from its current position
  const otherItems = items.filter(i => i.id !== itemId)
  
  let beforeItem: T | undefined
  let afterItem: T | undefined
  
  if (beforeId) {
    beforeItem = otherItems.find(i => i.id === beforeId)
  }
  if (afterId) {
    afterItem = otherItems.find(i => i.id === afterId)
  }
  
  const newOrderKey = generateOrderKey(beforeItem?.orderKey, afterItem?.orderKey)
  
  const updatedItem = { ...item, orderKey: newOrderKey }
  const reorderedItems = [...otherItems, updatedItem].sort((a, b) => 
    a.orderKey.localeCompare(b.orderKey)
  )
  
  return {
    newOrderKey,
    reorderedItems
  }
}