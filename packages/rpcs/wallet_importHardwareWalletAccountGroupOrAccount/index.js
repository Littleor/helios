import {
  enums,
  map,
  dbid,
  stringp,
  mapp,
  base32UserAddress,
  ethHexAddress,
  or,
  oneOrMore,
  password,
} from '@fluent-wallet/spec'
import {decode, encode} from '@fluent-wallet/base32-address'
import {encrypt} from 'browser-passworder'

export const NAME = 'wallet_importHardwareWalletAccountGroupOrAccount'

const AddressSchema = [
  map,
  {closed: true},
  ['address', [or, base32UserAddress, ethHexAddress]],
  ['nickname', stringp],
]

const BasicSchema = [
  map,
  {closed: true},
  ['password', {optional: true}, password],
  ['accountGroupData', mapp],
  ['address', [oneOrMore, AddressSchema]],
]

const NewAccountGroupSchema = [
  ['type', [enums, 'cfx', 'eth']],
  ['device', [enums, 'LedgerNanoS', 'LedgerNanoX']],
  ['accountGroupNickname', stringp],
]
const OldAccountGroupSchema = [['accountGroupId', dbid]]

export const schemas = {
  input: [
    or,
    BasicSchema.concat(NewAccountGroupSchema),
    BasicSchema.concat(OldAccountGroupSchema),
  ],
}

export const permissions = {
  external: ['popup'],
  methods: ['wallet_addVault', 'wallet_createAccount'],
  db: [
    'getPassword',
    'findGroup',
    't',
    'newAddressTx',
    'findNetwork',
    'findAccount',
  ],
}

export const main = async ({
  Err: {InvalidParams},
  rpcs: {wallet_addVault},
  db: {getPassword, findGroup, t, findNetwork, newAddressTx, findAccount},
  params: {
    password,
    device,
    type,
    address,
    accountGroupData,
    accountGroupId,
    accountGroupNickname,
  },
}) => {
  if (accountGroupNickname) {
    // credate new account group
    const toImport = {
      accountGroupData,
      nickname: accountGroupNickname,
      password,
      device,
      accounts: address,
    }

    if (type === 'cfx') toImport.cfxOnly = true

    return await wallet_addVault(toImport)
  }

  // add to existing account
  const group = findGroup({
    groupId: accountGroupId,
    g: {vault: {cfxOnly: 1, eid: 1}, account: 1},
  })

  if (!group) throw InvalidParams(`Invalid account group id: ${accountGroupId}`)

  const ddata = accountGroupData
  const data = await encrypt(getPassword(), JSON.stringify(ddata))

  let txs = [{eid: group.vault.eid, vault: {data, ddata}}]

  const networks = findNetwork({
    type: group.vault.cfxOnly ? 'cfx' : 'eth',
    g: {eid: 1, netId: 1},
  })

  txs = txs.concat(
    networks.reduce(
      (acc, {eid, netId}, idx) =>
        address.reduce((acc, {address, nickname}, jdx) => {
          const accountIndex = idx + group.account.length
          const [account] = findAccount({
            groupId: accountGroupId,
            index: accountIndex,
          })
          const accountId = account ?? `newaccount ${idx} ${jdx}`
          const value = group.vault.cfxOnly
            ? encode(decode(address).hexAddress, netId)
            : address
          const hex = group.vault.cfxOnly ? decode(address).hexAddress : address
          const addrTx = newAddressTx({
            eid: `newaddr ${idx} ${jdx}`,
            value,
            hex,
            network: eid,
          })
          return acc.concat([
            addrTx,
            {
              eid: accountId,
              account: {
                index: accountIndex,
                nickname,
                address: addrTx.eid,
                hidden: false,
              },
            },
            {
              eid: accountGroupId,
              accountGroup: {account: accountId},
            },
          ])
        }, acc),
      [],
    ),
  )

  t(txs)
  return accountGroupId
}
