'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useClients } from '@/hooks/useClients'
import { useTimerStore } from '@/stores/timerStore'

interface TimerFormProps {
  isOpen: boolean
  onClose: () => void
  mode: 'start' | 'manual'
}

export function TimerForm({ isOpen, onClose, mode }: TimerFormProps) {
  const { data: clients = [] } = useClients()
  const startTimer = useTimerStore((state) => state.startTimer)
  const addManualEntry = useTimerStore((state) => state.addManualEntry)

  const [taskName, setTaskName] = useState('')
  const [clientId, setClientId] = useState('')
  const [notes, setNotes] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) {
      setTaskName('')
      setClientId('')
      setNotes('')
      setDurationMinutes('30')
      setErrors({})
    }
  }, [isOpen])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
      clientName: selectedClient?.name ?? null,
      notes: notes.trim() ? notes.trim() : null,
    }

    if (mode === 'start') {
      startTimer(payload)
    } else {
      addManualEntry({
        ...payload,
        durationMinutes: parsedDuration,
      })
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'start' ? 'Start Time Entry' : 'Log Time Manually'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-lg">
        <Input
          label="Task"
          name="taskName"
          placeholder="Homepage redesign, discovery call, QA review..."
          value={taskName}
          onChange={(event) => setTaskName(event.target.value)}
          error={errors.taskName}
          required
        />

        <div className="space-y-sm">
          <label htmlFor="timer-client" className="block text-sm font-medium text-text-base">
            Client
          </label>
          <select
            id="timer-client"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="w-full rounded-md border-2 border-border-base bg-background-base px-lg py-md text-text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-brand"
          >
            <option value="">Unassigned</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
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

        <Textarea
          label="Notes"
          name="notes"
          placeholder="Optional context for this time entry"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
        />

        <div className="flex justify-end gap-md pt-md">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'start' ? 'Start Timer' : 'Save Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}