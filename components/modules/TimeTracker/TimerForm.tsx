'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useClients } from '@/hooks/useClients'
import { useCreateManualTimeLog, useCreateRunningTimeLog, useUpdateTimeLog } from '@/hooks/useTimeLogs'
import type { TimeLog } from '@/lib/types/database'

interface TimerFormProps {
  isOpen: boolean
  onClose: () => void
  mode: 'start' | 'manual' | 'edit'
  entry?: TimeLog | null
  renderMode?: 'modal' | 'inline'
}

export function TimerForm({
  isOpen,
  onClose,
  mode,
  entry = null,
  renderMode = 'modal',
}: TimerFormProps) {
  const inlineInputClassName =
    'theme-shell-field h-9 w-full rounded-[6px] px-3 py-1 text-[14px] leading-5 outline-none focus-visible:border-[var(--primary)]'

  const { data: clients = [] } = useClients()
  const createRunningTimeLog = useCreateRunningTimeLog()
  const createManualTimeLog = useCreateManualTimeLog()
  const updateTimeLog = useUpdateTimeLog()

  const [taskName, setTaskName] = useState('')
  const [clientId, setClientId] = useState('')
  const [notes, setNotes] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    setErrors({})
    setTaskName(entry?.task_name ?? '')
    setClientId(entry?.client_id ?? '')
    setNotes(entry?.notes ?? '')
    setDurationMinutes('30')
  }, [entry, isOpen, mode])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}
    if (!taskName.trim()) {
      nextErrors.taskName = 'Task name is required.'
    }

    const parsedDuration = Number(durationMinutes)
    if (mode === 'manual' && (!Number.isFinite(parsedDuration) || parsedDuration <= 0)) {
      nextErrors.durationMinutes = 'Enter a duration greater than 0 minutes.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const selectedClient = clients.find((client) => client.id === clientId)
    const payload = {
      taskName: taskName.trim(),
      clientId: selectedClient?.id ?? null,
      notes: notes.trim() ? notes.trim() : null,
    }

    try {
      if (mode === 'start') {
        await createRunningTimeLog.mutateAsync(payload)
      } else if (mode === 'manual') {
        await createManualTimeLog.mutateAsync({
          ...payload,
          durationMinutes: parsedDuration,
        })
      } else if (entry) {
        await updateTimeLog.mutateAsync({
          id: entry.id,
          ...payload,
        })
      }

      onClose()
    } catch (error: unknown) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save time entry.',
      })
    }
  }

  const isPending =
    createRunningTimeLog.isPending || createManualTimeLog.isPending || updateTimeLog.isPending

  const title =
    mode === 'start' ? 'Add Task' : mode === 'manual' ? 'Log Time Manually' : 'Edit Task'

  const formContent = (
    <form onSubmit={handleSubmit} className={renderMode === 'inline' ? 'space-y-[10px]' : 'space-y-lg'}>
      {renderMode === 'inline' ? (
        <>
          <Input
            name="taskName"
            placeholder="What are you working on?"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            error={errors.taskName}
            className={inlineInputClassName}
            required
          />

          <div className="w-full">
            <input
              id="timer-inline-notes"
              name="notes"
              type="text"
              placeholder="Add notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={inlineInputClassName}
            />
          </div>

          <Select
            id="timer-client"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="h-9 px-3"
          >
              <option value="">Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
          </Select>

          {mode === 'manual' && (
            <Input
              name="durationMinutes"
              type="number"
              min="1"
              step="1"
              placeholder="Duration in minutes"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              error={errors.durationMinutes}
              className={inlineInputClassName}
              required
            />
          )}
        </>
      ) : (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-base">Task</h3>
          <Input
            label="Task Name"
            name="taskName"
            placeholder="Homepage redesign, discovery call, QA review..."
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            error={errors.taskName}
            required
          />
        </section>
      )}

      {renderMode !== 'inline' && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-text-base">Details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="timer-client" className="mb-2 block text-sm font-medium text-text-base">
                Client
              </label>
              <Select
                id="timer-client"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="rounded-md border-2 border-border-base bg-background-base py-md text-text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand"
              >
                  <option value="">Unassigned</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
              </Select>
            </div>

            {mode === 'manual' && (
              <Input
                label="Duration (minutes)"
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                error={errors.durationMinutes}
                required
              />
            )}
          </div>

          <Textarea
            label="Notes"
            name="notes"
            placeholder="Optional context for this time entry"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
          />
        </section>
      )}

      {errors.submit && (
        <div className="rounded-md border border-feedback-error-base/40 bg-feedback-error-base/10 p-md text-sm text-feedback-error-text">
          {errors.submit}
        </div>
      )}

      {renderMode === 'inline' ? (
        <div className="flex items-center gap-[10px] pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="h-10 rounded-full border border-[var(--primary)] px-8 py-2 text-[12px] font-medium leading-[12px] text-text-muted transition-all hover:bg-[var(--surface-overlay)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            className="h-10 rounded-full bg-[var(--primary)] px-8 py-2 text-[14px] font-medium leading-4 text-[var(--base-white)] transition-all hover:opacity-90"
          >
            {mode === 'start' ? 'Create' : mode === 'manual' ? 'Save Entry' : 'Save Changes'}
          </Button>
        </div>
      ) : (
        <div className="flex justify-end gap-md pt-md">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {mode === 'start' ? 'Start Timer' : mode === 'manual' ? 'Save Entry' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  )

  if (renderMode === 'inline') {
    return formContent
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {formContent}
    </Modal>
  )
}
