import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface FlowFile {
  id: number
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  flow_source: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface FlowAnalysis {
  id: number
  flow_file_id: number
  user_identifier: string
  user_phone_analysis: any
  vehicle_analysis: any
  high_frequency_counterparties: any
  restricted_consumption: any
  restricted_consumption_summary: any
  large_transactions: any
  top_merchants: any
  summary: any
  created_at: string
  updated_at: string
}

export interface LegalDocument {
  id: number
  document_type: 'investigation_order' | 'seizure_freeze' | 'detention_fine' | 'police_transfer'
  case_number: string
  plaintiff: string
  defendant: string
  court: string
  investigation_target: string
  document_content: string
  file_path: string
  created_at: string
  updated_at: string
}

export interface HistoryRecord {
  id: number
  type: 'flow_analysis' | 'legal_document'
  title: string
  description: string
  file_path: string
  created_at: string
}

export const flowFileApi = {
  upload: (file: File, flowSource: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('flowSource', flowSource)
    return request.post<ApiResponse<FlowFile>>('/flow-files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  getAll: () => request.get<ApiResponse<FlowFile[]>>('/flow-files'),
  
  delete: (id: number) => request.delete<ApiResponse<void>>(`/flow-files/${id}`)
}

export const flowAnalysisApi = {
  analyze: (fileId: number) => request.post<ApiResponse<any>>(`/flow-analysis/analyze/${fileId}`),
  
  getResult: (fileId: number) => request.get<ApiResponse<FlowAnalysis[]>>(`/flow-analysis/${fileId}`)
}

export const legalDocumentApi = {
  generate: (data: {
    documentType: string
    caseNumber?: string
    plaintiff?: string
    defendant?: string
    court?: string
    investigationTarget?: string
    uploadedFile?: string
  }) => request.post<ApiResponse<LegalDocument>>('/legal-documents/generate', data),
  
  getAll: () => request.get<ApiResponse<LegalDocument[]>>('/legal-documents'),
  
  getById: (id: number) => request.get<ApiResponse<LegalDocument>>(`/legal-documents/${id}`),
  
  download: (id: number) => `${request.defaults.baseURL}/legal-documents/${id}/download`,
  
  delete: (id: number) => request.delete<ApiResponse<void>>(`/legal-documents/${id}`)
}

export const historyApi = {
  getAll: () => request.get<ApiResponse<HistoryRecord[]>>('/history')
}
