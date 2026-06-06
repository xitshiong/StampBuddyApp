'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  value: string
  onChange: (url: string) => void
  label: string
  aspectRatio?: '1/1' | '16/9'
  placeholderText?: string
}

export default function ImageUpload({
  value,
  onChange,
  label,
  aspectRatio = '1/1',
  placeholderText = 'Upload Image'
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSquare = aspectRatio === '1/1'

  async function uploadFile(file: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB')
      return
    }

    try {
      setUploading(true)
      const supabase = createClient()
      
      // Get current user to store files securely in their folder
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to upload files')
        return
      }

      // Generate a unique path: userId/timestamp_filename
      const fileExt = file.name.split('.').pop()
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20)
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}.${fileExt}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('merchant-branding')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('merchant-branding')
        .getPublicUrl(filePath)

      onChange(publicUrl)
      toast.success(`${label} uploaded!`)
    } catch (err: any) {
      toast.error(err.message || 'Error uploading file')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Upload Box / Image Display */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          width: isSquare ? 120 : '100%',
          aspectRatio: isSquare ? '1 / 1' : '16 / 9',
          borderRadius: 14,
          border: value ? 'none' : '2px dashed var(--border-soft)',
          background: isDragOver 
            ? 'color-mix(in srgb, var(--accent) 8%, var(--bg-surface))'
            : 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: uploading ? 'not-allowed' : 'pointer',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          boxShadow: isDragOver ? '0 0 0 2px var(--accent)' : 'none',
        }}
        className="upload-dropzone"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          disabled={uploading}
          style={{ display: 'none' }}
        />

        {value ? (
          <>
            {/* Render Image */}
            <img
              src={value}
              alt={label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            {/* Hover Action Overlay */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                opacity: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s ease',
                gap: 8,
              }}
              className="hover-overlay"
              onClick={(e) => {
                e.stopPropagation()
                if (uploading) return
                onChange('')
              }}
            >
              <div style={{
                background: '#fff',
                color: '#ef4444',
                padding: 8,
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'scale(0.9)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
              >
                <X size={16} />
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            textAlign: 'center',
            gap: 8,
          }}>
            {uploading ? (
              <Loader2 className="animate-spin" size={24} style={{ color: 'var(--accent)' }} />
            ) : (
              <Upload size={24} style={{ color: 'var(--text-muted)' }} />
            )}
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.1px',
            }}>
              {uploading ? 'Uploading...' : placeholderText}
            </span>
            {!uploading && !isSquare && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                Drag & drop or tap to browse
              </span>
            )}
          </div>
        )}
      </div>

      {/* CSS style injected for hover overlay styling */}
      <style>{`
        .upload-dropzone:hover .hover-overlay {
          opacity: 1 !important;
        }
        .upload-dropzone:hover {
          border-color: var(--accent) !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
