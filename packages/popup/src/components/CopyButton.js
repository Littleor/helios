import PropTypes from 'prop-types'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {CopyOutlined} from '@fluent-wallet/component-icons'
import Toast from '@fluent-wallet/component-toast'

function CopyButton({
  text,
  className = '',
  wrapperClassName = '',
  containerClassName = 'relative',
  CopyWrapper,
  CopyInner,
  toastClassName = '-top-9 left-0',
}) {
  const {t} = useTranslation()
  const [copied, setCopied] = useState(false)
  return (
    <div className={containerClassName} id="copyBtn">
      <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
        {CopyWrapper ? (
          <CopyWrapper className={wrapperClassName}>
            <CopyOutlined className={`cursor-pointer w-4 h-4 ${className}`} />
          </CopyWrapper>
        ) : (
          CopyInner || (
            <CopyOutlined className={`cursor-pointer w-4 h-4 ${className}`} />
          )
        )}
      </CopyToClipboard>
      <Toast
        content={t('copiedSuccess')}
        open={copied}
        type="line"
        onClose={() => setCopied(false)}
        className={toastClassName}
      />
    </div>
  )
}

CopyButton.propTypes = {
  text: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  toastClassName: PropTypes.string,
  CopyWrapper: PropTypes.elementType,
  CopyInner: PropTypes.node,
  containerClassName: PropTypes.string,
}

export default CopyButton
