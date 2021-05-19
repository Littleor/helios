// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {schemas, main} from '.'
import {validate} from '@cfxjs/spec'

describe('wallet_getVaults', function () {
  describe('schemas', function () {
    describe('output', function () {
      it('should validate the vaults', async function () {
        expect(validate(schemas.output, ['a', 'b'])).toBe(true)
        expect(validate(schemas.output, ['a', 1])).toBe(false)
      })
    })
  })

  describe('main', function () {
    it('should return the vaults', async function () {
      const fakeVaults = []
      const input = {
        db: {
          getVault: jest.fn(() => fakeVaults),
        },
      }
      await expect(main(input)).resolves.toEqual(fakeVaults)
    })
  })
})
