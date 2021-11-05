import PropTypes from 'prop-types'
import Button from '@fluent-wallet/component-button'
import {request} from '../utils'
import {RPC_METHODS, ROUTES} from '../constants'
import {usePendingAuthReq} from '../hooks/useApi'
import {useHistory} from 'react-router-dom'
import {useState} from 'react'

const {
  WALLET_REJECT_PENDING_AUTH_REQUSET,
  WALLET_REQUEST_PERMISSIONS,
  WALLET_SWITCH_CONFLUX_CHAIN,
  WALLET_SWITCH_ETHEREUM_CHAIN,
  CFX_SIGN_TYPED_DATA_V4,
  ETH_SIGN_TYPED_DATA_V4,
  WALLET_ADD_ETHEREUM_CHAIN,
  WALLET_ADD_CONFLUX_CHAIN,
  WALLET_WATCH_ASSET,
} = RPC_METHODS
const {HOME} = ROUTES
function DappFooter({
  cancelText,
  confirmText,
  confirmDisabled = false,
  confirmParams = {},
  onClickCancel,
  onClickConfirm,
}) {
  const history = useHistory()
  const pendingAuthReq = usePendingAuthReq()
  const [{req, eid}] = pendingAuthReq?.length ? pendingAuthReq : [{}]
  const [sendingRequestStatus, setSendingRequestStatus] = useState(false)

  const onCancel = () => {
    request(WALLET_REJECT_PENDING_AUTH_REQUSET, {authReqId: eid}).then(
      ({result}) => {
        result && history.push(HOME)
        result && onClickCancel && onClickCancel()
        // TODO: error message
      },
    )
  }

  const onConfirm = () => {
    if (!req?.method || sendingRequestStatus) {
      return
    }
    setSendingRequestStatus(true)
    const params = {...confirmParams}
    switch (req.method) {
      case WALLET_REQUEST_PERMISSIONS:
        params.permissions = req.params
        break
      case WALLET_SWITCH_CONFLUX_CHAIN:
        params.chainConfig = req.params
        break
      case WALLET_SWITCH_ETHEREUM_CHAIN:
        params.chainConfig = req.params
        break
      case CFX_SIGN_TYPED_DATA_V4:
        params.data = req.params
        break
      case ETH_SIGN_TYPED_DATA_V4:
        params.data = req.params
        break
      case WALLET_ADD_ETHEREUM_CHAIN:
        params.newChainConfig = req.params
        break
      case WALLET_ADD_CONFLUX_CHAIN:
        params.newChainConfig = req.params
        break
      case WALLET_WATCH_ASSET:
        params.asset = req.params
        break
    }

    request(req.method, {authReqId: eid, ...params}).then(({result}) => {
      setSendingRequestStatus(false)
      result && onClickConfirm && onClickConfirm()
      result && history.push(HOME)
      // TODO: error message
    })
  }

  return (
    <footer className="flex px-4">
      <Button
        id="cancelBtn"
        className="flex-1"
        variant="outlined"
        onClick={onCancel}
      >
        {cancelText}
      </Button>
      <div className="w-3" />
      <Button
        id="confirmBtn"
        className="flex-1"
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmText}
      </Button>
    </footer>
  )
}

DappFooter.propTypes = {
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  confirmParams: PropTypes.object,
  confirmDisabled: PropTypes.bool,
  onClickConfirm: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default DappFooter
