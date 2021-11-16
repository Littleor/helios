import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {TitleNav, CompWithLabel} from '../../components'
import Button from '@fluent-wallet/component-button'
import Input from '@fluent-wallet/component-input'
import {request} from '../../utils'
import {RPC_METHODS, ROUTES} from '../../constants'
import useGlobalStore from '../../stores'
import {useCreatedPasswordGuard} from '../../hooks'
import {useHdAccountGroup} from '../../hooks/useApi'
import {useSWRConfig} from 'swr'
const {
  WALLET_GET_ACCOUNT_GROUP,
  ACCOUNT_GROUP_TYPE,
  WALLET_VALIDATE_MNEMONIC,
  WALLET_IMPORT_MNEMONIC,
  WALLET_ZERO_ACCOUNT_GROUP,
  WALLET_IS_LOCKED,
} = RPC_METHODS
const {HOME} = ROUTES

function ImportSeedPhrase() {
  const {t} = useTranslation()
  const history = useHistory()
  const {mutate} = useSWRConfig()

  const [name, setName] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [accountNamePlaceholder, setAccountNamePlaceholder] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const createdPassword = useGlobalStore(state => state.createdPassword)

  const hdGroup = useHdAccountGroup()

  useCreatedPasswordGuard()
  useEffect(() => {
    setAccountNamePlaceholder(`Seed-${hdGroup.length + 1}`)
  }, [hdGroup])

  const onChangeName = e => {
    setName(e.target.value)
  }
  const onChangeKeygen = e => {
    setMnemonic(e.target.value)
  }
  const dispatchMutate = () => {
    mutate([WALLET_ZERO_ACCOUNT_GROUP], false)
    mutate([WALLET_IS_LOCKED], false)
    mutate([WALLET_GET_ACCOUNT_GROUP])
    mutate([WALLET_GET_ACCOUNT_GROUP, ACCOUNT_GROUP_TYPE.HD])
  }

  const onCreate = () => {
    if (!mnemonic) {
      // TODO: replace error msg
      return setErrorMessage('Required')
    }

    if (!creatingAccount) {
      setCreatingAccount(true)
      request(WALLET_VALIDATE_MNEMONIC, {
        mnemonic,
      }).then(({result}) => {
        if (result?.valid) {
          let params = {
            nickname: name || accountNamePlaceholder,
            mnemonic,
          }
          if (createdPassword) {
            params['password'] = createdPassword
          }
          return request(WALLET_IMPORT_MNEMONIC, params).then(
            ({error, result}) => {
              setCreatingAccount(false)
              if (result) {
                dispatchMutate()
                history.push(HOME)
              }
              if (error) {
                setErrorMessage(error.message.split('\n')[0])
              }
            },
          )
        }
        // TODO: replace error msg
        setErrorMessage('Invalid or inner error!')
        setCreatingAccount(false)
      })
    }
  }

  return (
    <div className="bg-bg h-full flex flex-col" id="importSeedPhraseContainer">
      <TitleNav title={t('seedImport')} />
      <form
        onSubmit={event => event.preventDefault()}
        className="flex flex-1 px-3 flex-col justify-between"
      >
        <section>
          <CompWithLabel label={t(`seedGroupName`)}>
            <Input
              onChange={onChangeName}
              width="w-full"
              placeholder={accountNamePlaceholder}
              maxLength="20"
              value={name}
            />
          </CompWithLabel>
          <CompWithLabel label={t('seedPhrase')}>
            <Input
              errorMessage={errorMessage}
              elementType="textarea"
              placeholder={t(`seedImportPlaceholder`)}
              onChange={onChangeKeygen}
              width="w-full"
              className="resize-none"
              textareaSize="h-40"
              value={mnemonic}
            />
          </CompWithLabel>
        </section>
        <section className="mb-4">
          <Button
            id="importSeedPhraseBtn"
            className="w-70  mx-auto"
            onClick={onCreate}
            disabled={!name && !accountNamePlaceholder}
          >
            {t('import')}
          </Button>
        </section>
      </form>
    </div>
  )
}

export default ImportSeedPhrase
