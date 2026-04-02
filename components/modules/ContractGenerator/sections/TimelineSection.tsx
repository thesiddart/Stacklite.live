'use client'

import React, { useState } from 'react'
import { AddCircleBold, CloseCircleBold } from 'sicons'
import { useContractStore } from '@/stores/contractStore'

export function TimelineSection() {
  const { formData, updateFormData } = useContractStore()
  const [showMilestones, setShowMilestones] = useState(
    Boolean(formData.milestones && formData.milestones.length > 0)
  )

  const milestones = formData.milestones || []

  const addMilestone = () => {
    updateFormData({
      milestones: [...milestones, { label: '', date: '' }],
    })
  }

  const removeMilestone = (index: number) => {
    updateFormData({
      milestones: milestones.filter((_, i) => i !== index),
    })
  }

  const updateMilestone = (index: number, field: 'label' | 'date', value: string) => {
    const updated = [...milestones]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData({ milestones: updated })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-text-base">
          Timeline
        </h3>
        <p className="mt-0.5 text-[12px] text-text-muted">
          Set the project start and end dates, and optionally add milestones.
        </p>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            Start Date
          </label>
          <input
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => updateFormData({ start_date: e.target.value })}
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-text-base">
            End Date
          </label>
          <input
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => updateFormData({ end_date: e.target.value })}
            className="theme-shell-field h-8 w-full rounded-[6px] px-3 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        {!showMilestones ? (
          <button
            type="button"
            onClick={() => {
              setShowMilestones(true)
              if (milestones.length === 0) addMilestone()
            }}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
          >
            <AddCircleBold size={14} />
            Add milestones
          </button>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[12px] font-medium text-text-base">
                Milestones
              </label>
              <button
                type="button"
                onClick={addMilestone}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--tertiary)] hover:text-[var(--primary)]"
              >
                <AddCircleBold size={14} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={milestone.label}
                    onChange={(e) => updateMilestone(index, 'label', e.target.value)}
                    placeholder="Milestone label"
                    className="theme-shell-field h-7 flex-1 rounded-[6px] px-2 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
                  />
                  <input
                    type="date"
                    value={milestone.date}
                    onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                    className="theme-shell-field h-7 w-[130px] rounded-[6px] px-2 text-[13px] focus-visible:border-[var(--primary)] focus-visible:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-text-muted hover:text-feedback-error-text"
                  >
                    <CloseCircleBold size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
