/**
 * @fileOverview consts used in extension
 * @name index.js
 */

export const MAINNET = 'mainnet'
export const TESTNET = 'testnet'
export const LOCALHOST = 'localhost'
export const CUSTOM = 'custom'
export const EXT_STORAGE = 'ext-storage'
export const NULL_HEX_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ADMINE_CONTROL_HEX_ADDRESS =
  '0x0888000000000000000000000000000000000000'
export const SPONSOR_WHITELIST_CONTROL_HEX_ADDRESS =
  '0x0888000000000000000000000000000000000001'
export const STAKING_HEX_ADDRESS = '0x0888000000000000000000000000000000000002'

export const INTERNAL_CONTRACTS_HEX_ADDRESS = [
  ADMINE_CONTROL_HEX_ADDRESS,
  SPONSOR_WHITELIST_CONTROL_HEX_ADDRESS,
  STAKING_HEX_ADDRESS,
]

export const ADDRESS_TYPES = ['user', 'contract', 'builtin', 'null']

export const CONFLUX_MAINNET_RPC_ENDPOINT = 'https://portal-main.confluxrpc.com'
export const CONFLUX_TESTNET_RPC_ENDPOINT = 'https://portal-test.confluxrpc.com'
