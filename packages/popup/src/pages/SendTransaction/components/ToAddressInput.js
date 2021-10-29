import {useState} from 'react'
import PropTypes from 'prop-types'
import {useRPC} from '@fluent-wallet/use-rpc'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {isHexAddress} from '@fluent-wallet/account'
import {useTranslation} from 'react-i18next'
import {CompWithLabel} from '../../../components'
import Input from '@fluent-wallet/component-input'
import {useNetworkTypeIsEth, useNetworkTypeIsCfx} from '../../../hooks/useApi'
import {RPC_METHODS} from '../../../constants'
const {WALLET_GET_CURRENT_NETWORK} = RPC_METHODS

function ToAddressInput({address, onChangeAddress}) {
  const {t} = useTranslation()
  const {data: currentNetwork} = useRPC(
    [WALLET_GET_CURRENT_NETWORK],
    undefined,
    {
      fallbackData: {},
    },
  )
  const [errorMessage, setErrorMessage] = useState('')
  const networkTypeIsCfx = useNetworkTypeIsCfx()
  const networkTypeIsEth = useNetworkTypeIsEth()
  const onChange = value => {
    onChangeAddress && onChangeAddress(value)
    if (
      networkTypeIsCfx &&
      !validateBase32Address(value, currentNetwork?.netId)
    ) {
      // TODO i18n
      setErrorMessage('Please enter validate cfx address')
    }
    if (networkTypeIsEth && !isHexAddress(value)) {
      // TODO i18n
      setErrorMessage('Please enter validate hex address')
    }
  }
  return (
    <CompWithLabel label={t('toAddressLabel')} className="!mt-0">
      <Input
        width="w-full"
        maxLength="20"
        value={address}
        placeholder={t('toAddressPlaceholder')}
        onChange={e => onChange(e.target.value)}
        errorMessage={errorMessage}
      />
    </CompWithLabel>
  )
}

ToAddressInput.propTypes = {
  address: PropTypes.string,
  onChangeAddress: PropTypes.func,
}

export default ToAddressInput
