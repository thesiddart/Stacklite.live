'use client'

import React, { useState } from 'react'
import { AddCircleBold, CloseCircleBold } from 'sicons'
import { useContractStore } from '@/stores/contractStore'

export function ProjectSection() {
  const { formData, updateFormData } = useContractStore()
  const [showExclusions, setShowExclusions] = useState(Boolean(formData.exclusions))

  const deliverables = formData.deliverables || []

  const addDeliverable = () => {
    updateFormData({
      deliverables: [...deliverables, { text: '' }],
    })
  }

  const removeDeliverable = (index: number) => {
    updateFormData({
      deliverables: deliverables.filter((_, i) => i !== index),
    })
  }

  const updateDeliverable = (index: number, text: string) => {
    const updated = [...deliverables]
    updated[index] = { text }
    updateFormData({ deliverables: updated })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-text-base">
          Project
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">
          Define the scope of work, deliverables, and exclusions.
        </p>
      </div>

      {/* Project name */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-text-base">
          Project Name
        </label>
        <input
          type="text"
          value={formData.project_name || ''}
          onChange={(e) => updateFormData({ project_name: e.target.value })}
          placeholder="e.g. Brand Identity Redesign"
          className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
      </div>

      {/* Scope */}
      <div>
        <label className="mb-1 block text-[12px] font-medium text-text-base">
          Scope of Work
        </label>
        <textarea
          value={formData.scope || ''}
          onChange={(e) => updateFormData({ scope: e.target.value })}
          placeholder="Describe the core scope, what the project involves, and what the client can expect."
          rows={5}
          className="theme-shell-field w-full rounded-[6px] px-3 py-2 text-[13px] leading-5 focus-visible:border-[var(--primary)] focus-visible:outline-none"
        />
      </div>

      {/* Deliverables */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[12px] font-medium text-text-base">
            Deliverables
          </label>
          <button
            type="button"
            onClick={addDeliverable}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
          >
            <AddCircleBold size={14} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {deliverables.length === 0 && (
            <p className="text-[12px] text-text-muted">
              No deliverables yet. Click Add to list what the client will receive.
            </p>
          )}
          {deliverables.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-[12px] text-text-muted">•</span>
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateDeliverable(index, e.target.value)}
                placeholder={`Deliverable ${index + 1}`}
                className="theme-shell-field h-7 flex-1 rounded-[6px] px-2 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
              />
              <button
                type="button"
                onClick={() => removeDeliverable(index)}
                className="text-text-muted hover:text-feedback-error-text"
              >
                <CloseCircleBold size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Exclusions */}
      <div>
        {!showExclusions ? (
          <button
            type="button"
            onClick={() => setShowExclusions(true)}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
          >
            <AddCircleBold size={14} />
            Add exclusions
          </button>
        ) : (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-[12px] font-medium text-text-base">
                Not Included
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowExclusions(false)
                  updateFormData({ exclusions: null })
                }}
                className="text-[12px] text-text-muted hover:text-feedback-error-text"
              >
                Remove
              </button>
            </div>
            <textarea
              value={formData.exclusions || ''}
              onChange={(e) => updateFormData({ exclusions: e.target.value })}
              placeholder="Explicitly define what is out of scope."
              rows={3}
              className="theme-shell-field w-full rounded-[6px] px-3 py-2 text-[13px] leading-5 focus-visible:border-[var(--primary)] focus-visible:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
