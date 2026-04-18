import { describe, expect, it } from 'vitest'
import {
  buildDashboardUrlWithModule,
  getInitialDockTabForModuleQuery,
  parseWorkspaceModuleQueryParam,
} from '@/lib/navigation/workspaceModules'

describe('workspaceModules', () => {
  describe('parseWorkspaceModuleQueryParam', () => {
    it('returns null for empty input', () => {
      expect(parseWorkspaceModuleQueryParam(null)).toBe(null)
      expect(parseWorkspaceModuleQueryParam(undefined)).toBe(null)
      expect(parseWorkspaceModuleQueryParam('')).toBe(null)
      expect(parseWorkspaceModuleQueryParam('   ')).toBe(null)
    })

    it('normalizes casing', () => {
      expect(parseWorkspaceModuleQueryParam('CONTRACT')).toBe('contract')
      expect(parseWorkspaceModuleQueryParam(' Invoice ')).toBe('invoice')
    })

    it('returns invalid for unknown modules', () => {
      expect(parseWorkspaceModuleQueryParam('unknown')).toBe('invalid')
    })
  })

  describe('getInitialDockTabForModuleQuery', () => {
    it('maps modules to dock or null for side panels', () => {
      expect(getInitialDockTabForModuleQuery('contract')).toBe('contract')
      expect(getInitialDockTabForModuleQuery('invoice')).toBe('invoice')
      expect(getInitialDockTabForModuleQuery('income')).toBe('income')
      expect(getInitialDockTabForModuleQuery('clients')).toBe(null)
      expect(getInitialDockTabForModuleQuery('time')).toBe(null)
    })

    it('defaults center tab for absent or invalid', () => {
      expect(getInitialDockTabForModuleQuery(null)).toBe('contract')
      expect(getInitialDockTabForModuleQuery('invalid')).toBe('contract')
    })
  })

  describe('buildDashboardUrlWithModule', () => {
    it('builds encoded dashboard URL with module param', () => {
      expect(buildDashboardUrlWithModule('clients')).toBe('/dashboard?module=clients')
    })
  })
})
