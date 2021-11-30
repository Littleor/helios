import {useState} from 'react'
import {useQuery} from '../../hooks'
import {useEffectOnce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {HomeNav} from '../../components'
import {PendingQueue} from './components'
import {
  CurrentAccount,
  CurrentNetwork,
  CurrentDapp,
  HomeTokenList,
  AccountList,
  NetworkList,
  AddToken,
} from './components'
function Home() {
  const {t} = useTranslation()
  const [accountStatus, setAccountStatus] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(false)
  const [addTokenStatus, setAddTokenStatus] = useState(false)
  const query = useQuery()
  const history = useHistory()

  useEffectOnce(() => {
    if (query.get('open') === 'account-list') {
      history.replace('')
      setAccountStatus(true)
    }
  })
  return (
    <div
      className="flex flex-col bg-bg h-full relative overflow-hidden"
      id="homeContainer"
    >
      <button onClick={() => open(location.href)} className="z-10 text-white">
        open
      </button>
      <img
        src="/images/home-bg.svg"
        alt="home"
        className="absolute top-0 z-0"
      />
      <HomeNav />
      <div className="flex flex-col pt-1 px-4 z-10">
        <div className="flex items-start justify-between">
          <CurrentAccount onOpenAccount={() => setAccountStatus(true)} />
          <CurrentNetwork onOpenNetwork={() => setNetworkStatus(true)} />
        </div>
        <div className="flex mt-3 mb-4">
          <Button
            id="sendBtn"
            size="small"
            variant="outlined"
            className="!border-white !text-white !bg-transparent !hover:none mr-2"
            onClick={() => {
              history.push('/send-transaction')
            }}
          >
            {t('send')}
          </Button>
          <div className="relative">
            <Button
              id="historyBtn"
              size="small"
              variant="outlined"
              className="!border-white !text-white !bg-transparent !hover:none"
            >
              {t('history')}
            </Button>
            <PendingQueue count={3} />
          </div>
        </div>
      </div>
      <HomeTokenList onOpenAddToken={() => setAddTokenStatus(true)} />
      <CurrentDapp />
      <AccountList
        onClose={() => setAccountStatus(false)}
        onOpen={accountStatus}
      />
      <NetworkList
        onClose={() => setNetworkStatus(false)}
        onOpen={networkStatus}
      />
      <AddToken
        onClose={() => setAddTokenStatus(false)}
        onOpen={addTokenStatus}
      />
    </div>
  )
}

export default Home
