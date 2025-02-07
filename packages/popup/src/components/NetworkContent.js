import PropTypes from 'prop-types'
import Message from '@fluent-wallet/component-message'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {RPC_METHODS} from '../constants'
import {request} from '../utils'
import {useCfxNetwork, useCurrentAddress} from '../hooks/useApi'
import useLoading from '../hooks/useLoading'
import {CustomTag} from './'
import {useTranslation} from 'react-i18next'

const {WALLET_SET_CURRENT_NETWORK} = RPC_METHODS
const networkTypeColorObj = {
  mainnet: 'bg-primary-10 text-[#ACB6E0]',
  testnet: 'bg-[#FFF7F4] text-[#F5B797]',
  custom: 'bg-[#F0FDFC] text-[#83DBC6]',
}
const itemWrapperPaddingStyleObj = {
  small: 'pl-3',
  medium: 'pl-3.5',
}
function NetworkItem({
  networkName,
  networkType,
  rpcUrl,
  chainId,
  symbol,
  blockExplorerUrl = '',
  icon,
  onClickNetworkItem,
  networkId,
  networkItemSize = 'medium',
  onClose,
  showCurrentIcon = true,
  needSwitchNet = true,
  ...props
}) {
  const {setLoading} = useLoading()
  const {t} = useTranslation()
  const {
    data: {
      network: {eid},
    },
    mutate,
  } = useCurrentAddress()
  const networkTypeColor = networkTypeColorObj[networkType] || ''
  const itemWrapperPaddingStyle =
    itemWrapperPaddingStyleObj[networkItemSize] || ''

  const onChangeNetwork = () => {
    onClose && onClose()
    const netData = {
      networkId,
      networkName,
      icon,
      rpcUrl,
      chainId,
      symbol,
      blockExplorerUrl,
      networkType,
    }
    if (!needSwitchNet) {
      return onClickNetworkItem?.({...netData})
    }
    if (eid !== networkId) {
      setLoading(true)
      request(WALLET_SET_CURRENT_NETWORK, [networkId])
        .then(() => {
          setLoading(false)
          mutate()
          Message.warning({
            content: t('addressHasBeenChanged'),
            top: '110px',
            duration: 1,
          })
          onClickNetworkItem?.({...netData})
        })
        .catch(error => {
          // TODO: need deal with error condition
          Message.error({
            content: error?.message || t('changeNetworkError'),
            top: '110px',
            duration: 1,
          })
          setLoading(false)
        })
    }
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={`bg-gray-0 mt-4 h-15 flex items-center rounded relative hover:bg-primary-4 ${
        eid === networkId && needSwitchNet ? 'cursor-default' : 'cursor-pointer'
      } ${itemWrapperPaddingStyle} pr-3.5`}
      onClick={onChangeNetwork}
    >
      <div className="w-8 h-8 border border-solid border-gray-20 rounded-full flex items-center justify-center">
        <img
          alt="network-icon"
          className="w-7 h-7"
          src={icon || '/images/default-network-icon.svg'}
        />
      </div>
      <div className="ml-2.5 text-gray-80 text-sm font-medium flex-1">
        {networkName}
      </div>
      {eid === networkId && showCurrentIcon && (
        <CheckCircleFilled className="w-4 h-4 text-success" />
      )}
      <CustomTag
        className={`absolute right-0 top-0 ${networkTypeColor} px-2`}
        width="w-auto"
      >
        {t(networkType)}
      </CustomTag>
    </div>
  )
}
NetworkItem.propTypes = {
  networkName: PropTypes.string.isRequired,
  rpcUrl: PropTypes.string.isRequired,
  chainId: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  blockExplorerUrl: PropTypes.string,
  networkType: PropTypes.oneOf(['mainnet', 'testnet', 'custom']).isRequired,
  networkItemSize: PropTypes.oneOf(['small', 'medium']),
  networkId: PropTypes.number.isRequired,
  icon: PropTypes.string,
  onClickNetworkItem: PropTypes.func,
  onClose: PropTypes.func,
  showCurrentIcon: PropTypes.bool,
  needSwitchNet: PropTypes.bool,
}

function NetworkContent({
  onClickNetworkItem,
  networkItemSize,
  onClose,
  ...props
}) {
  const networkData = useCfxNetwork()

  return (
    <>
      {networkData.map(
        ({
          eid,
          name,
          isCustom,
          isMainnet,
          isTestnet,
          icon,
          endpoint,
          chainId,
          ticker,
          scanUrl,
        }) => (
          <NetworkItem
            key={eid}
            networkId={eid}
            networkName={name}
            networkItemSize={networkItemSize}
            networkType={
              isCustom
                ? 'custom'
                : isMainnet
                ? 'mainnet'
                : isTestnet
                ? 'testnet'
                : ''
            }
            rpcUrl={endpoint}
            chainId={chainId}
            symbol={ticker.symbol}
            blockExplorerUrl={scanUrl}
            onClickNetworkItem={onClickNetworkItem}
            onClose={onClose}
            icon={icon}
            id={`item-${eid}`}
            {...props}
          />
        ),
      )}
    </>
  )
}

NetworkContent.propTypes = {
  onClickNetworkItem: PropTypes.func,
  onClose: PropTypes.func,
  networkItemSize: PropTypes.oneOf(['small', 'medium']),
}

export default NetworkContent
