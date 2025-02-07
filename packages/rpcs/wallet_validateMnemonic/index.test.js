// eslint-disable-next-line no-unused-vars
import {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import {main} from './index.js'

describe('wallet_validateMnemonic', function () {
  describe('main', function () {
    test('logic', () => {
      expect(
        main({
          params: {
            mnemonic:
              'error mom brown point sun magnet armor fish urge business until plastic',
          },
        }),
      ).toEqual({valid: true})

      expect(
        main({
          params: {
            mnemonic: '令 尝 实 俗 状 倒 轻 水 纤 暴 急 令',
          },
        }),
      ).toEqual({valid: true})

      expect(
        main({
          params: {
            mnemonic:
              '  mom brown point sun magnet armor fish urge business until plastic',
          },
        }),
      ).toEqual({valid: false, invalidWord: ' '})

      expect(
        main({
          params: {
            mnemonic:
              'errorr mom brown point sun magnet armor fish urge business until plastic',
          },
        }),
      ).toEqual({valid: false, invalidWord: 'errorr'})

      expect(
        main({
          params: {
            mnemonic:
              '好 mom brown point sun magnet armor fish urge business until plastic',
          },
        }),
      ).toEqual({valid: false, invalidWord: 'mom'})

      expect(
        main({
          params: {
            mnemonic: 'error',
          },
        }),
      ).toEqual({valid: false, invalidWordlists: ['english', 'EN']})

      expect(
        main({
          params: {
            mnemonic:
              'error error error error error error error error error error error error ',
          },
        }),
      ).toEqual({valid: false, invalidWordlists: ['english', 'EN']})
    })
  })
})
