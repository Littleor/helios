import {PASSWORD_REG_EXP, RPC_METHODS} from '../constants'
const globalThis = window ?? global
const {WALLET_ZERO_ACCOUNT_GROUP, WALLET_IS_LOCKED, WALLET_GET_ACCOUNT_GROUP} =
  RPC_METHODS

export function request(...args) {
  const [method, params] = args
  const requestObj = {
    method,
  }
  if (params) {
    requestObj.params = params
  }
  return globalThis.___CFXJS_USE_RPC__PRIVIDER?.request(requestObj)
}

export function shuffle(arr) {
  let arrAdd = [...arr]
  for (let i = 1; i < arrAdd.length; i++) {
    const random = Math.floor(Math.random() * (i + 1))
    ;[arrAdd[i], arrAdd[random]] = [arrAdd[random], arrAdd[i]]
  }
  return arrAdd
}

export function validatePasswordReg(value) {
  return PASSWORD_REG_EXP.test(value)
}

export function removeAllChild(dom) {
  let child = dom.lastElementChild
  while (child) {
    dom.removeChild(child)
    child = dom.lastElementChild
  }
}
export function jsNumberForAddress(address) {
  if (!address) {
    return address
  }
  const addr = address.slice(2, 10)
  const seed = parseInt(addr, 16)
  return seed
}

export function updateAddedNewAccount(mutate, noAccountBefore, groupType) {
  if (noAccountBefore) {
    mutate([WALLET_ZERO_ACCOUNT_GROUP], false)
    mutate([WALLET_IS_LOCKED], false)
  }
  mutate([WALLET_GET_ACCOUNT_GROUP])
  mutate([WALLET_GET_ACCOUNT_GROUP, groupType])
}
