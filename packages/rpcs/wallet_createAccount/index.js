import {map, dbid, nickname} from '@fluent-wallet/spec'
import {decrypt} from 'browser-passworder'
import {getNthAccountOfHDKey} from '@fluent-wallet/hdkey'
import {toAccountAddress} from '@fluent-wallet/account'
import {encode} from '@fluent-wallet/base32-address'

export const NAME = 'wallet_createAccount'

export const schemas = {
  input: [
    map,
    {closed: true},
    ['accountGroupId', dbid],
    ['nickname', {optional: true}, nickname],
  ],
}

export const permissions = {
  db: [
    'findGroup',
    'findAccount',
    'getNetwork',
    'getPassword',
    't',
    'newAddressTx',
  ],
  external: ['popup'],
}

export const main = async ({
  db: {findGroup, getPassword, getNetwork, t, findAccount, newAddressTx},
  params: {accountGroupId, nickname},
  Err: {InvalidParams},
}) => {
  const group = findGroup({
    groupId: accountGroupId,
    g: {
      accountGroup: {
        vault: {type: 1, ddata: 1, data: 1, cfxOnly: 1, eid: 1},
        nickname: 1,
      },
      account: {_accountGroup: {nickname: 1}},
    },
  })
  if (!group) throw InvalidParams('Invalid account group id')
  const {vault} = group
  if (vault.type !== 'hd')
    throw InvalidParams("Can't add account into none hd vault")

  const existAccounts = group.account || []
  const nextAccountIdx = existAccounts.length
  const hasDuplicateNicknameInSameAccountGroup = existAccounts.reduce(
    (acc, account) => acc || account.nickname === nickname,
    false,
  )
  if (hasDuplicateNicknameInSameAccountGroup)
    throw InvalidParams(
      `Invalid nickname "${nickname}", duplicate with other account in the same account group`,
    )

  const password = getPassword()
  const decrypted = vault.ddata ?? (await decrypt(password, vault.data))
  const networks = getNetwork()

  return (
    await Promise.all(
      networks.map(async ({eid, hdPath, netId, type}) => ({
        eid,
        netId,
        type,
        addr: await getNthAccountOfHDKey({
          mnemonic: decrypted,
          hdPath: hdPath.value,
          nth: nextAccountIdx,
          only0x1Prefixed: vault.cfxOnly,
        }),
      })),
    ).then(params =>
      params.map(({eid, netId, type, addr: {address, privateKey}}, idx) => {
        let accountId
        try {
          accountId = findAccount({
            index: nextAccountIdx,
            groupId: accountGroupId,
          })
        } catch (err) {
          accountId = 'accountId'
        }

        const addrTx = newAddressTx({
          eid: -1,
          network: eid,
          value:
            type === 'cfx' ? encode(toAccountAddress(address), netId) : address,
          hex: address,
          pk: privateKey,
        })

        const {tempids} = t([
          addrTx,
          !idx && {
            eid: accountId,
            account: {
              index: nextAccountIdx,
              accountGroup: accountGroupId,
              nickname: nickname ?? `${group.nickname}-${nextAccountIdx + 1}`,
              address: addrTx.eid,
              hidden: false,
            },
          },
          idx && {
            eid: {account: {id: [accountGroupId, nextAccountIdx]}},
            account: {
              address: addrTx.eid,
            },
          },
        ])

        accountId = tempids.accountId ?? accountId
        return accountId
      }),
    )
  )[0]
}
