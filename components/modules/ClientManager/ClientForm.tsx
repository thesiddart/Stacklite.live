'use client'

import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { clientSchema, updateClientSchema } from '@/lib/validations/client'
import type { ClientFormData, UpdateClientFormData } from '@/lib/validations/client'
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

function getTagSelectValue(rawTag: string): '' | 'design' | 'development' | 'custom' {
  const normalized = rawTag.trim().toLowerCase()

  if (normalized === '') return ''
  if (normalized === 'design') return 'design'
  if (normalized === 'development' || normalized === 'devlopment') return 'development'
  return 'custom'
}

const COUNTRY_STATE_MAP: Record<string, string[]> = {
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
    'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ],
  India: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ],
  Nepal: [
    'Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
  ],
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar', flag: '🇺🇸' },
  { value: 'NPR', label: 'NPR - Nepalese Rupee', flag: '🇳🇵' },
  { value: 'INR', label: 'INR - Indian Rupee', flag: '🇮🇳' },
]

const COUNTRY_CODES = [
  'US', 'IN', 'NP', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG', 'AE', 'NL', 'SE', 'CH', 'NZ',
]

function getCountryOptions(): string[] {
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return ['United States', 'India', 'Nepal']
  }

  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
  const regions = COUNTRY_CODES

  const names = regions
    .map((code) => displayNames.of(code))
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b))

  return names.length > 0 ? names : ['United States', 'India', 'Nepal']
}

function getCurrentCountryName(): string | null {
  if (typeof navigator === 'undefined' || typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return null
  }

  const locale = navigator.language || ''
  const regionCode = locale.includes('-') ? locale.split('-')[1] : ''

  if (!regionCode) return null

  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
  return displayNames.of(regionCode.toUpperCase()) || null
}

const toDateInputValue = (value: string | null) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
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
      last_contacted_at: toDateInputValue(client.last_contacted_at),
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
    'theme-shell-field h-9 rounded-[6px] pl-4 pr-4 py-1 text-[14px] leading-5 focus-visible:border-[var(--primary)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none'
  const authTextareaClassName =
    'theme-shell-field rounded-[6px] pl-4 pr-4 py-2 text-[14px] leading-5 focus-visible:border-[var(--primary)] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none'

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const [formData, setFormData] = useState<ClientFormState>(() => getInitialFormData(mode, client))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countryOptions, setCountryOptions] = useState<string[]>(() => getCountryOptions())

  const stateOptions = COUNTRY_STATE_MAP[formData.country] || []
  const tagSelectValue = getTagSelectValue(formData.tags)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData(getInitialFormData(mode, client))
    setErrors({})
  }, [client, isOpen, mode])

  useEffect(() => {
    setCountryOptions(getCountryOptions())
  }, [])

  useEffect(() => {
    if (!isOpen || mode !== 'create') return

    const currentCountry = getCurrentCountryName()

    if (currentCountry && !formData.country) {
      setFormData((prev) => ({ ...prev, country: currentCountry }))
      if (!countryOptions.includes(currentCountry)) {
        setCountryOptions((prev) => [currentCountry, ...prev].sort((a, b) => a.localeCompare(b)))
      }
    }
  }, [countryOptions, formData.country, isOpen, mode])
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    const value =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value

    setFormData((prev) => {
      if (name === 'country') {
        return {
          ...prev,
          country: value as string,
          state_province: '',
        }
      }

      return { ...prev, [name]: value }
    })
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
      const nonBlockingOptionalFields = new Set([
        'company_name',
        'company_type',
        'industry',
        'website',
        'tax_id',
      ])

      const handleParseFailure = (issues: z.ZodIssue[]) => {
        const fieldErrors: Record<string, string> = {}

        for (const issue of issues) {
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
          return true
        }

        return false
      }

      if (mode === 'create') {
        const parseResult = clientSchema.safeParse(payloadInput)

        if (!parseResult.success) {
          if (handleParseFailure(parseResult.error.issues)) {
            return
          }
        }

        const payload = (parseResult.success ? parseResult.data : payloadInput) as ClientFormData
        await createMutation.mutateAsync(payload)
      } else if (client) {
        const parseResult = updateClientSchema.safeParse(payloadInput)

        if (!parseResult.success) {
          if (handleParseFailure(parseResult.error.issues)) {
            return
          }
        }

        const payload = (parseResult.success ? parseResult.data : payloadInput) as UpdateClientFormData
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

  const handleTagSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value

    setFormData((prev) => {
      if (selectedTag === 'custom') {
        const currentIsCustom = getTagSelectValue(prev.tags) === 'custom'
        return {
          ...prev,
          tags: currentIsCustom ? prev.tags : '',
        }
      }

      return {
        ...prev,
        tags: selectedTag,
      }
    })

    if (errors.tags) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors.tags
        return nextErrors
      })
    }
  }

  const handleCustomTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customTagValue = e.target.value

    setFormData((prev) => ({
      ...prev,
      tags: customTagValue,
    }))

    if (errors.tags) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors.tags
        return nextErrors
      })
    }
  }

  const handleDateChange = (name: keyof ClientFormState, nextValue: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[name]
        return nextErrors
      })
    }
  }

  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 px-4 pb-4 pt-3 [&_label>span]:text-feedback-error-base"
    >
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-base">Identity</h3>
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
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-base">Company</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Company Type"
              name="company_type"
              value={formData.company_type}
              onChange={handleChange}
              error={errors.company_type}
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
            </Select>
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
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-base">Contact</h3>
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
            <Select
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={errors.country}
              required
            >
              <option value="">Select country</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>

            <Select
              label="State/Province"
              name="state_province"
              value={formData.state_province}
              onChange={handleChange}
              error={errors.state_province}
              disabled={!formData.country || stateOptions.length === 0}
              required
            >
              <option value="">{!formData.country ? 'Select country first' : 'Select state/province'}</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
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
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-base">
            Billing and Preferences
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Payment Currency"
              name="payment_currency"
              value={formData.payment_currency}
              onChange={handleChange}
              error={errors.payment_currency}
              required
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </Select>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-base">
                Payment Terms <span className="text-text-brand">*</span>
              </label>
              <Input
                label=""
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                error={errors.payment_terms}
                placeholder="Net 30"
                className={authInputClassName}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Tags"
              name="tags"
              value={tagSelectValue}
              onChange={handleTagSelectChange}
              error={errors.tags}
              required
            >
              <option value="">Select tag</option>
              <option value="design">design</option>
              <option value="development">development</option>
              <option value="custom">custom</option>
            </Select>
            <DatePicker
              label="Last Contacted"
              name="last_contacted_at"
              value={formData.last_contacted_at}
              onChange={(nextValue) => handleDateChange('last_contacted_at', nextValue)}
              error={errors.last_contacted_at}
              className={authInputClassName}
              required
            />
          </div>
          {tagSelectValue === 'custom' && (
            <Input
              label="Custom Tag"
              name="custom_tag"
              value={formData.tags}
              onChange={handleCustomTagChange}
              error={errors.tags}
              placeholder="Enter custom tag"
              className={authInputClassName}
              required
            />
          )}
          <label className="flex items-center gap-2 text-sm text-text-base">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border border-[var(--surface-input-border)] bg-[var(--surface-input)] text-[var(--primary)] focus:ring-[var(--primary)]"
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
            className="h-10 rounded-full border border-[var(--primary)] bg-transparent px-4 text-sm font-medium text-text-muted transition-all hover:bg-[var(--surface-overlay)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="h-10 rounded-full bg-[var(--primary)] px-4 text-sm font-medium text-[var(--base-white)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
      contentClassName="max-w-[44.1rem]"
    >
      {formContent}
    </Modal>
  )
}
