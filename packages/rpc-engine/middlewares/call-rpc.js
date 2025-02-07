import {defMiddleware} from '../middleware.js'
import {addBreadcrumb} from '@fluent-wallet/sentry'

function formatRes(res, id) {
  const template = {id, jsonrpc: '2.0'}
  if (res !== undefined) {
    // already valid res (from fullnode)
    if (res?.jsonrpc && Object.prototype.hasOwnProperty.call(res, 'id'))
      return res
    // only the res result
    return {...template, result: res}
  }

  // undefined res
  return {...template, result: '0x1'}
}

const RequestLockMethods = [
  'wallet_watchAsset',
  'wallet_requestPermissions',
  'wallet_switchConfluxChain',
  'wallet_switchEthereumChain',
  'wallet_addConfluxChain',
  'wallet_addEthereumChain',
  // 'cfx_sendTransaction',
  // 'personal_sign',
  // 'cfx_signTypedData_v4',
  // 'eth_signTypedData_v4',
  'cfx_requestAccounts',
  'eth_requestAccounts',
]

export default defMiddleware(
  ({tx: {map, pluck, sideEffect, comp}, stream: {resolve}}) => [
    {
      id: 'beforeCallRpc',
      ins: {
        req: {stream: '/validateRpcParams/node'},
      },
      fn: comp(
        sideEffect(() => addBreadcrumb({category: 'middleware-beforeCallRpc'})),
        map(async ({rpcStore, req, db}) => {
          const method = rpcStore[req.method]
          // validate dapp permissions to call this rpc
          if (
            req._inpage &&
            method.permissions.scope &&
            !method.permissions.locked
          ) {
            const isValid = await req.rpcs
              .wallet_validateAppPermissions({
                permissions: rpcStore[req.method].permissions.scope,
              })
              .catch(err => {
                err.rpcData = req
                throw err
              })
            if (!isValid) {
              const err = req.Err.Unauthorized()
              err.rpcData = req
              throw err
            }
          }

          // guard inpage methods when wallet locked
          if (
            // req is from inpage
            req._inpage &&
            // req allowed to be called from inpage
            rpcStore[req.method].permissions.external.includes('inpage') &&
            // wallet is locked
            db.getLocked() &&
            // method is unlocked only method
            !rpcStore[req.method].permissions.locked
          ) {
            // allow some inpage rpc methods to request the unlock ui
            if (RequestLockMethods.includes(req.method)) {
              await req.rpcs.wallet_requestUnlockUI().catch(err => {
                err.rpcData = req
                throw err
              })
            } else {
              // reject others
              const err = req.Err.Unauthorized()
              err.rpcData = req
              throw err
            }
          }

          return req
        }),
      ),
    },
    {
      id: 'callRpc',
      ins: {
        req: {
          stream: r => r('/beforeCallRpc/node').subscribe(resolve()),
        },
      },
      fn: comp(
        sideEffect(() => addBreadcrumb({category: 'middleware-callRpc'})),
        map(async ({rpcStore, req}) => ({
          req,
          res: await rpcStore[req.method].main(req).catch(err => {
            err.rpcData = req
            throw err
          }),
        })),
      ),
    },
    {
      id: 'afterCallRpc',
      ins: {
        ctx: {stream: r => r('/callRpc/node').subscribe(resolve())},
      },
      fn: comp(
        sideEffect(() => addBreadcrumb({category: 'middleware-afterCallRpc'})),
        map(({ctx: {req, res}}) => ({
          req,
          res: formatRes(res, req.id),
        })),
      ),
      outs: {
        req: n => n.subscribe({}, {xform: pluck('req')}),
        res: n => n.subscribe({}, {xform: pluck('res')}),
      },
    },
    {
      id: 'END',
      ins: {
        res: {stream: '/afterCallRpc/outs/res'},
        req: {stream: '/afterCallRpc/outs/req'},
      },
      fn: comp(
        sideEffect(() => addBreadcrumb({category: 'middleware-END'})),
        sideEffect(({res, req: {_c}}) => _c.write(res)),
      ),
    },
  ],
)
