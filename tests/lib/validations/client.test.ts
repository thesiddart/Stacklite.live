import { describe, expect, it } from 'vitest'
import { clientSchema } from '@/lib/validations/client'

describe('clientSchema', () => {
  it('normalizes optional fields, defaults currency, and parses metadata', () => {
    const result = clientSchema.parse({
      name: '  Acme Studio  ',
      email: '',
      payment_currency: '',
      tags: ' design, retainer , , ',
      metadata: '{"tier":"gold","active":true}',
      notes: '  Long-term client  ',
    })

    expect(result).toMatchObject({
      name: 'Acme Studio',
      email: null,
      payment_currency: 'USD',
      tags: ['design', 'retainer'],
      metadata: { tier: 'gold', active: true },
      notes: 'Long-term client',
    })
  })

  it('accepts nullable optional values without introducing junk data', () => {
    const result = clientSchema.parse({
      name: 'Northwind',
      website: '',
      phone: '   ',
      company_type: '',
      preferred_contact_method: '',
    })

    expect(result.website).toBeNull()
    expect(result.phone).toBeNull()
    expect(result.company_type).toBeNull()
    expect(result.preferred_contact_method).toBeNull()
  })

  it('rejects invalid email, currency, and metadata payloads', () => {
    expect(() =>
      clientSchema.parse({
        name: 'Broken Co',
        email: 'not-an-email',
      })
    ).toThrow('Invalid email address')

    expect(() =>
      clientSchema.parse({
        name: 'Broken Co',
        payment_currency: 'usdollars',
      })
    ).toThrow('Payment currency must be a 3-letter currency code')

    expect(() =>
      clientSchema.parse({
        name: 'Broken Co',
        metadata: '{invalid json}',
      })
    ).toThrow('Metadata must be valid JSON')
  })
})
