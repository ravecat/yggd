import { describe, test, expect } from 'vitest'
import { ValidationError, type JsonApiError } from './client.js'

describe('ValidationError', () => {
  describe('traverseErrors', () => {
    test('extracts errors for specified fields', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          title: 'Required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
        {
          code: 'invalid_attribute',
          title: 'InvalidAttribute',
          detail: 'is invalid',
          status: '400',
          source: { pointer: '/data/attributes/content' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title', 'content'])

      expect(result).toEqual({
        title: ['is required'],
        content: ['is invalid'],
        general: [],
      })
    })

    test('collects unmatched errors in general', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          title: 'Required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
        {
          code: 'invalid_attribute',
          title: 'InvalidAttribute',
          detail: 'is invalid',
          status: '400',
          source: { pointer: '/data/attributes/author_id' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title', 'content'])

      expect(result).toEqual({
        title: ['is required'],
        content: [],
        general: ['is invalid'],
      })
    })

    test('handles errors without pointer', () => {
      const errors: JsonApiError[] = [
        {
          code: 'server_error',
          title: 'ServerError',
          detail: 'Something went wrong',
          status: '500',
        },
        {
          code: 'required',
          title: 'Required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title'])

      expect(result).toEqual({
        title: ['is required'],
        general: ['Something went wrong'],
      })
    })

    test('handles multiple errors for same field', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          title: 'Required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
        {
          code: 'too_short',
          title: 'TooShort',
          detail: 'must be at least 3 characters',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title'])

      expect(result).toEqual({
        title: ['is required', 'must be at least 3 characters'],
        general: [],
      })
    })

    test('handles relationship errors', () => {
      const errors: JsonApiError[] = [
        {
          code: 'invalid_relationship',
          title: 'InvalidRelationship',
          detail: 'author does not exist',
          status: '400',
          source: { pointer: '/data/relationships/author' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['author', 'title'])

      expect(result).toEqual({
        author: ['author does not exist'],
        title: [],
        general: [],
      })
    })

    test('handles empty errors array', () => {
      const validationError = new ValidationError([], 400)
      const result = validationError.traverseErrors(['title', 'content'])

      expect(result).toEqual({
        title: [],
        content: [],
        general: [],
      })
    })

    test('extracts field name from author_id pointer', () => {
      const errors: JsonApiError[] = [
        {
          code: 'invalid_attribute',
          title: 'InvalidAttribute',
          detail: 'is invalid',
          status: '400',
          source: { pointer: '/data/attributes/author_id' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['author_id'])

      expect(result).toEqual({
        author_id: ['is invalid'],
        general: [],
      })
    })

    test('prefers detail over title for error message', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          title: 'Required',
          detail: 'field is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title'])

      expect(result.title[0]).toBe('field is required')
    })

    test('falls back to title when detail is missing', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          title: 'Required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title'])

      expect(result.title[0]).toBe('Required')
    })

    test('provides fallback message when both detail and title are missing', () => {
      const errors: JsonApiError[] = [
        {
          code: 'unknown',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['title'])

      expect(result.title[0]).toBe('Validation error')
    })

    test('type inference works correctly', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/email' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const result = validationError.traverseErrors(['email', 'password', 'username'] as const)

      // Type check: all specified fields should be present
      expect(result).toHaveProperty('email')
      expect(result).toHaveProperty('password')
      expect(result).toHaveProperty('username')
      expect(result).toHaveProperty('general')
      
      // Verify type inference works
      expect(Array.isArray(result.email)).toBe(true)
      expect(Array.isArray(result.password)).toBe(true)
      expect(Array.isArray(result.username)).toBe(true)
      expect(Array.isArray(result.general)).toBe(true)
    })
  })

  describe('getErrorsByPath (deprecated)', () => {
    test('extracts errors by exact field match', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
        {
          code: 'invalid',
          detail: 'is invalid',
          status: '400',
          source: { pointer: '/data/attributes/subtitle' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const titleErrors = validationError.getErrorsByPath('title')

      // Should only match 'title', not 'subtitle'
      expect(titleErrors).toEqual(['is required'])
      expect(titleErrors.length).toBe(1)
    })

    test('returns errors without pointer when no path specified', () => {
      const errors: JsonApiError[] = [
        {
          code: 'server_error',
          detail: 'Something went wrong',
          status: '500',
        },
        {
          code: 'required',
          detail: 'is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const generalErrors = validationError.getErrorsByPath()

      expect(generalErrors).toEqual(['Something went wrong'])
    })
  })

  describe('getAllErrors (deprecated)', () => {
    test('groups all errors by field name', () => {
      const errors: JsonApiError[] = [
        {
          code: 'required',
          detail: 'title is required',
          status: '400',
          source: { pointer: '/data/attributes/title' },
        },
        {
          code: 'invalid',
          detail: 'content is invalid',
          status: '400',
          source: { pointer: '/data/attributes/content' },
        },
        {
          code: 'server_error',
          detail: 'Something went wrong',
          status: '500',
        },
      ]

      const validationError = new ValidationError(errors, 400)
      const allErrors = validationError.getAllErrors()

      expect(allErrors).toEqual({
        title: ['title is required'],
        content: ['content is invalid'],
        general: ['Something went wrong'],
      })
    })
  })
})
