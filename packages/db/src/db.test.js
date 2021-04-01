// eslint-disable-next-line no-unused-vars
import {expect, describe, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore
import * as db from './db.js'

const schema = {
  vault: {
    type: {
      doc: 'Type of vault: public, pk, mnemonic',
    },
    data: {
      doc: 'Encrypted vault data',
    },
  },
  account: {
    hexAddress: {
      identity: true,
      doc: 'Account hex address',
    },
    vault: {
      ref: true,
      doc: 'Entity ID of vault',
    },
  },
}

describe('db', function () {
  describe('create db', function () {
    it('should return the get getby and create functions defined in schema', async function () {
      const conn = db.createdb(schema)
      expect(typeof conn.createVault === 'function').toBe(true)
      expect(typeof conn.getVault === 'function').toBe(true)
      expect(typeof conn.getVaultByType === 'function').toBe(true)
      expect(typeof conn.getVaultByData === 'function').toBe(true)

      expect(typeof conn.createAccount === 'function').toBe(true)
      expect(typeof conn.getAccount === 'function').toBe(true)
      expect(typeof conn.getAccountByVault === 'function').toBe(true)
      expect(typeof conn.getAccountByHexAddress === 'function').toBe(true)
    })
  })

  describe('create fn', function () {
    it('should create the data and return the right entity id', async function () {
      const conn = db.createdb(schema)
      const txReport = conn.createVault({type: 'a', data: 'b'})
      // the first entity in db has the entity id 1
      expect(txReport).toBe(1)
    })
  })

  describe('get by fn', function () {
    it('should get the right data with simple query', async function () {
      const conn = db.createdb(schema)
      const vaultId = conn.createVault({type: 'a', data: 'b'})
      conn.createAccount({
        vault: vaultId,
        hexAddress: '0x10000000000000000000000000000000000000000000000000',
      })

      let rst, vault, account
      rst = conn.getVaultByType('a')
      expect(Array.isArray(rst)).toBe(true)
      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.id).toBe(1)
      account = conn.getAccountByVault(vaultId)[0]
      expect(account.vault.type).toBe('a')

      rst = conn.getVaultByData('b')
      expect(Array.isArray(rst)).toBe(true)
      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.id).toBe(1)
    })

    it('should return a empty array if found no data', async function () {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      let rst
      rst = conn.getVaultByType('c')
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(0)
    })
  })

  describe('get fn', function () {
    it('should get the right data', async function () {
      const conn = db.createdb(schema)
      conn.createVault({type: 'a', data: 'b'})
      conn.createVault({type: 'a', data: 'c'})
      let rst, vault
      rst = conn.getVault({type: 'a'})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(2)

      vault = rst[0]
      expect(vault.data).toBe('b')
      expect(vault.type).toBe('a')
      expect(vault.id).toBe(1)

      vault = rst[1]
      expect(vault.data).toBe('c')
      expect(vault.type).toBe('a')
      expect(vault.id).toBe(2)

      // default to $and logic
      rst = conn.getVault({type: 'a', data: 'b'})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(1)

      // $or logic
      rst = conn.getVault({type: 'a', data: 'b', $or: true})
      expect(Array.isArray(rst)).toBe(true)
      expect(rst.length).toBe(2)
    })
  })
})
