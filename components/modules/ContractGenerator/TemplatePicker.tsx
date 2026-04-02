'use client'

import React from 'react'
import {
  DocumentText1Bold,
  MagicStarBold,
  CodeBold,
  Timer1Bold,
  DocumentBold,
} from 'sicons'
import type { TemplateType } from '@/lib/validations/contract'

interface TemplatePickerProps {
  onSelect: (type: TemplateType) => void
}

const TEMPLATES: {
  type: TemplateType
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
}[] = [
  {
    type: 'general',
    title: 'General',
    subtitle: 'Freelance',
    description: 'All-purpose agreement',
    icon: <DocumentText1Bold size={24} />,
  },
  {
    type: 'design',
    title: 'Design',
    subtitle: 'Project',
    description: 'Revisions, deliverables',
    icon: <MagicStarBold size={24} />,
  },
  {
    type: 'development',
    title: 'Development',
    subtitle: 'Project',
    description: 'IP ownership, repo handover',
    icon: <CodeBold size={24} />,
  },
  {
    type: 'retainer',
    title: 'Consulting',
    subtitle: 'Retainer',
    description: 'Monthly terms',
    icon: <Timer1Bold size={24} />,
  },
  {
    type: 'blank',
    title: 'Blank',
    subtitle: '',
    description: 'Start from scratch',
    icon: <DocumentBold size={24} />,
  },
]

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-base">
          Choose a template
        </h2>
        <p className="mt-1 text-[13px] text-text-muted">
          Each template pre-fills relevant sections with sensible defaults.
        </p>
      </div>

      <div className="grid w-full max-w-[560px] grid-cols-3 gap-3">
        {TEMPLATES.slice(0, 3).map((template) => (
          <button
            key={template.type}
            type="button"
            onClick={() => onSelect(template.type)}
            className="group flex flex-col items-start gap-3 rounded-[14px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4 text-left transition-all duration-200 hover:border-[var(--primary)] hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--surface-chip)] text-[var(--tertiary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
              {template.icon}
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-tight text-text-base">
                {template.title}
              </p>
              {template.subtitle && (
                <p className="text-[13px] font-medium text-text-muted">
                  {template.subtitle}
                </p>
              )}
              <p className="mt-1 text-[12px] text-text-muted">
                {template.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid w-full max-w-[560px] grid-cols-2 gap-3">
        {TEMPLATES.slice(3).map((template) => (
          <button
            key={template.type}
            type="button"
            onClick={() => onSelect(template.type)}
            className="group flex flex-col items-start gap-3 rounded-[14px] border border-[var(--surface-panel-border)] bg-[var(--surface-card)] p-4 text-left transition-all duration-200 hover:border-[var(--primary)] hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--surface-chip)] text-[var(--tertiary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
              {template.icon}
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-tight text-text-base">
                {template.title}
              </p>
              {template.subtitle && (
                <p className="text-[13px] font-medium text-text-muted">
                  {template.subtitle}
                </p>
              )}
              <p className="mt-1 text-[12px] text-text-muted">
                {template.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
