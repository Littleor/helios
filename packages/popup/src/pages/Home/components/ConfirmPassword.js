import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Modal from '@fluent-wallet/component-modal'
import Button from '@fluent-wallet/component-button'
import {PasswordInput} from '../../../components'

function ConfirmPassword({open, onCancel, onConfirm}) {
  const {t} = useTranslation()

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={t('enterPassword')}
      content={t('disconnectContent')}
      actions={[
        <Button
          className="flex flex-1 mr-3"
          onClick={onCancel}
          variant="outlined"
          key="cancel"
          id="cancelBtn"
        >
          {t('cancel')}
        </Button>,
        <Button
          className="flex flex-1"
          onClick={onConfirm}
          key="confirm"
          id="confirmBtn"
        >
          {t('confirm')}
        </Button>,
      ]}
    />
  )
}
ConfirmPassword.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

export default ConfirmPassword
