/* eslint-disable no-empty */
import {optParam} from '@fluent-wallet/spec'

export const NAME = 'wallet_handleUnfinishedTxs'

export const schemas = {
  input: optParam,
}

export const permissions = {
  locked: true,
  methods: [
    'wallet_handleUnfinishedCFXTx', // 'wallet_handleUnfinishedETHTx'
  ],
  db: ['getUnfinishedTx'],
}

export const main = ({
  db: {getUnfinishedTx},
  rpcs: {
    wallet_handleUnfinishedCFXTx, // wallet_handleUnfinishedETHTx
  },
}) => {
  getUnfinishedTx().forEach(({tx, address, network}) => {
    if (network.type === 'cfx') {
      try {
        wallet_handleUnfinishedCFXTx({network}, {tx, address: address.eid})
      } catch (err) {}
    } else {
      try {
        // wallet_handleUnfinishedETHTx(txinfo)
      } catch (err) {}
    }
  })
}
