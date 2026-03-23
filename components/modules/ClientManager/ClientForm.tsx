'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { clientSchema, updateClientSchema } from '@/lib/validations/client'
import type { Client } from '@/lib/types/database'

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  client?: Client | null
  mode: 'create' | 'edit'
  renderMode?: 'modal' | 'inline'
}

interface ClientFormState {
  name: string
  email: string
  phone: string
  company_name: string
  address: string
  contact_person_first_name: string
  contact_person_last_name: string
  company_type: string
  tax_id: string
  website: string
  industry: string
  preferred_contact_method: string
  payment_currency: string
  payment_terms: string
  country: string
  state_province: string
  postal_code: string
  is_active: boolean
  tags: string
  metadata: string
  last_contacted_at: string
  notes: string
}

const toDateTimeLocal = (value: string | null) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

const getInitialFormData = (mode: 'create' | 'edit', client?: Client | null): ClientFormState => {
  if (mode === 'edit' && client) {
    return {
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company_name: client.company_name || '',
      address: client.address || '',
      contact_person_first_name: client.contact_person_first_name || '',
      contact_person_last_name: client.contact_person_last_name || '',
      company_type: client.company_type || '',
      tax_id: client.tax_id || '',
      website: client.website || '',
      industry: client.industry || '',
      preferred_contact_method: client.preferred_contact_method || '',
      payment_currency: client.payment_currency || 'USD',
      payment_terms: client.payment_terms || '',
      country: client.country || '',
      state_province: client.state_province || '',
      postal_code: client.postal_code || '',
      is_active: client.is_active,
      tags: client.tags?.join(', ') || '',
      metadata: client.metadata ? JSON.stringify(client.metadata, null, 2) : '',
      last_contacted_at: toDateTimeLocal(client.last_contacted_at),
      notes: client.notes || '',
    }
  }

  return {
    name: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    contact_person_first_name: '',
    contact_person_last_name: '',
    company_type: '',
    tax_id: '',
    website: '',
    industry: '',
    preferred_contact_method: '',
    payment_currency: 'USD',
    payment_terms: '',
    country: '',
    state_province: '',
    postal_code: '',
    is_active: true,
    tags: '',
    metadata: '',
    last_contacted_at: '',
    notes: '',
  }
}

export function ClientForm({
  isOpen,
  onClose,
  client,
  mode,
  renderMode = 'modal',
}: ClientFormProps) {
  const authInputClassName =
    'h-9 rounded-[6px] border border-[#ebebeb] bg-white pl-4 pr-4 py-1 text-[14px] leading-5 text-[#333333] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus-visible:border-[var(--primary,#7962f4)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none'
  const authSelectClassName =
    'h-9 w-full appearance-none rounded-[6px] border border-[#ebebeb] bg-white pl-4 pr-10 py-1 text-[14px] leading-5 text-[#333333] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus-visible:border-[var(--primary,#7962f4)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none'
  const authTextareaClassName =
    'rounded-[6px] border border-[#ebebeb] bg-white pl-4 pr-4 py-2 text-[14px] leading-5 text-[#333333] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] focus-visible:border-[var(--primary,#7962f4)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none'

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const [formData, setFormData] = useState<ClientFormState>(() => getInitialFormData(mode, client))
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    const value =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value

    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const schema = mode === 'create' ? clientSchema : updateClientSchema
      const requiredFields: Array<{ key: keyof ClientFormState; message: string }> = [
        { key: 'name', message: 'Client name is required' },
        { key: 'email', message: 'Email is required' },
        { key: 'phone', message: 'Phone is required' },
        { key: 'country', message: 'Country is required' },
        { key: 'state_province', message: 'State/Province is required' },
        { key: 'address', message: 'Address is required' },
        { key: 'payment_currency', message: 'Payment currency is required' },
        { key: 'payment_terms', message: 'Payment terms is required' },
        { key: 'tags', message: 'Tag is required' },
        { key: 'last_contacted_at', message: 'Last contacted is required' },
      ]

      const requiredErrors: Record<string, string> = {}
      for (const field of requiredFields) {
        const value = formData[field.key]
        if (typeof value === 'string' && value.trim() === '') {
          requiredErrors[field.key] = field.message
        }
      }

      if (Object.keys(requiredErrors).length > 0) {
        setErrors(requiredErrors)
        return
      }

      const asOptional = (value: string) => {
        const trimmed = value.trim()
        return trimmed === '' ? undefined : trimmed
      }

      const payloadInput = {
        name: formData.name,
        email: asOptional(formData.email),
        phone: asOptional(formData.phone),
        company_name: asOptional(formData.company_name),
        address: asOptional(formData.address),
        company_type: asOptional(formData.company_type),
        tax_id: asOptional(formData.tax_id),
        website: asOptional(formData.website),
        industry: asOptional(formData.industry),
        payment_currency: asOptional(formData.payment_currency),
        payment_terms: asOptional(formData.payment_terms),
        country: asOptional(formData.country),
        state_province: asOptional(formData.state_province),
        is_active: formData.is_active,
        tags: asOptional(formData.tags),
        last_contacted_at: asOptional(formData.last_contacted_at),
      }

      const parseResult = schema.safeParse(payloadInput)

      const nonBlockingOptionalFields = new Set([
        'company_name',
        'company_type',
        'industry',
        'website',
        'tax_id',
      ])

      let payload: z.infer<typeof schema>
      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {}

        for (const issue of parseResult.error.issues) {
          const path = issue.path[0]
          if (typeof path !== 'string') {
            continue
          }

          if (nonBlockingOptionalFields.has(path)) {
            continue
          }

          fieldErrors[path] = issue.message
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
          return
        }

        payload = payloadInput as z.infer<typeof schema>
      } else {
        payload = parseResult.data
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
      } else if (client) {
        await updateMutation.mutateAsync({ id: client.id, data: payload })
      }
      
      onClose()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors({ submit: error.message })
      }
    }
  }
  
  const isLoading = createMutation.isPending || updateMutation.isPending
  
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-4 pt-3">
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#333333]">Identity</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Client Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              className={authInputClassName}
              required
            />
            <Input
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              error={errors.company_name}
              placeholder="Acme Inc."
              className={authInputClassName}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#333333]">Company</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#333333]">Company Type</label>
              <div className="relative">
                <select
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleChange}
                  className={authSelectClassName}
                >
                  <option value="">Select company type</option>
                  <option value="individual">Individual</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="nonprofit">Nonprofit</option>
                  <option value="agency">Agency</option>
                  <option value="other">Other</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#333333]" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {errors.company_type && <p className="mt-xs text-sm text-feedback-error-text">{errors.company_type}</p>}
            </div>
            <Input
              label="Industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              error={errors.industry}
              placeholder="Software"
              className={authInputClassName}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              error={errors.website}
              placeholder="https://example.com"
              className={authInputClassName}
            />
            <Input
              label="Tax ID"
              name="tax_id"
              value={formData.tax_id}
              onChange={handleChange}
              error={errors.tax_id}
              placeholder="12-3456789"
              className={authInputClassName}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#333333]">Contact</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john@example.com"
              className={authInputClassName}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="+1 (555) 123-4567"
              className={authInputClassName}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={errors.country}
              placeholder="United States"
              className={authInputClassName}
              required
            />
            <Input
              label="State/Province"
              name="state_province"
              value={formData.state_province}
              onChange={handleChange}
              error={errors.state_province}
              placeholder="California"
              className={authInputClassName}
              required
            />
          </div>
          <Textarea
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="123 Main St, City, State 12345"
            className={authTextareaClassName}
            rows={2}
            required
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#333333]">
            Billing and Preferences
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Payment Currency"
              name="payment_currency"
              value={formData.payment_currency}
              onChange={handleChange}
              error={errors.payment_currency}
              placeholder="USD"
              className={authInputClassName}
              required
            />
            <Input
              label="Payment Terms"
              name="payment_terms"
              value={formData.payment_terms}
              onChange={handleChange}
              error={errors.payment_terms}
              placeholder="Net 30"
              className={authInputClassName}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#333333]">
                Tags <span className="text-feedback-error-base">*</span>
              </label>
              <div className="relative">
                <select
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={authSelectClassName}
                  required
                >
                  <option value="">Select tag</option>
                  <option value="design">design</option>
                  <option value="devlopment">devlopment</option>
                  <option value="custom">custom</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#333333]" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {errors.tags && <p className="mt-xs text-sm text-feedback-error-text">{errors.tags}</p>}
            </div>
            <Input
              label="Last Contacted"
              name="last_contacted_at"
              type="datetime-local"
              value={formData.last_contacted_at}
              onChange={handleChange}
              error={errors.last_contacted_at}
              className={authInputClassName}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[#333333]">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border border-[#ebebeb] bg-white text-[var(--primary,#7962f4)] focus:ring-[var(--primary,#7962f4)]"
            />
            Active client
          </label>
        </section>
        
        {errors.submit && (
          <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md text-sm text-feedback-error-text">
            {errors.submit}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 rounded-full border border-[var(--primary,#7962f4)] bg-transparent px-4 text-sm font-medium text-[#5c5c5c] transition-all hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="h-10 rounded-full bg-[var(--primary,#7962f4)] px-4 text-sm font-medium text-[var(--base-white,#fefefe)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Add Client' : 'Save Changes'}
          </button>
        </div>
      </form>
  )

  if (renderMode === 'inline') {
    if (!isOpen) {
      return null
    }

    return (
      <div className="theme-scrollbar h-full min-h-0 overflow-y-auto">
        {formContent}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Client' : 'Edit Client'}
      size="lg"
    >
      {formContent}
    </Modal>
  )
}
