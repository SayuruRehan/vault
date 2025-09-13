export type NodeType = 'FOLDER' | 'DOC'

export interface TreeNode {
  id: string
  type: NodeType
  name: string
  parentId: string | null
  orderKey: string
  createdAt: Date
  updatedAt: Date
  children?: TreeNode[]
  doc?: DocumentContent
}

export interface DocumentContent {
  nodeId: string
  contentJson: string
  plainText: string
  lastSavedAt: Date
}

export interface FlatNode {
  id: string
  type: NodeType
  name: string
  parentId: string | null
  orderKey: string
  createdAt: Date
  updatedAt: Date
  doc?: DocumentContent
}

// Editor types
export interface EditorState {
  content: any // Tiptap JSON content
  isEditable: boolean
  isSaving: boolean
  lastSaved?: Date
  hasUnsavedChanges: boolean
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateNodeRequest {
  type: NodeType
  name: string
  parentId?: string
}

export interface UpdateNodeRequest {
  name?: string
  parentId?: string
  orderKey?: string
}

export interface MoveNodeRequest {
  newParentId?: string
  beforeNodeId?: string
  afterNodeId?: string
}

export interface SaveDocumentRequest {
  contentJson: string
  plainText: string
  lastClientHash?: string
}

// Voice recognition types
export interface VoiceRecognitionState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  error?: string
}

// PDF types
export interface PDFImportRequest {
  targetParentId?: string
}

export interface PDFImportResponse {
  nodeId: string
  name: string
  success: boolean
  error?: string
}