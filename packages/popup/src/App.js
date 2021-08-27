import React, {Suspense, lazy} from 'react'
// import {useRPC} from '@cfxjs/use-rpc'
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom'
import './index.css'

const HomePage = lazy(() => import('./pages/Home'))
const ConfirmSeed = lazy(() => import('./pages/ConfirmSeed'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const NewSeed = lazy(() => import('./pages/NewSeed'))
const WithCurrentSeed = lazy(() => import('./pages/WithCurrentSeed'))
const Unlock = lazy(() => import('./pages/Unlock'))
const Welcome = lazy(() => import('./pages/Welcome'))
const SetPassword = lazy(() => import('./pages/SetPassword'))
const SelectCreateType = lazy(() => import('./pages/SelectCreateType'))
const ImportAccount = lazy(() => import('./pages/ImportAccount'))

function App() {
  // const a = useRPC('wallet_generateMnemonic')
  // const b = useRPC('wallet_generatePrivateKey')

  // console.log('data = ', a, b)
  return (
    <div className="h-160 w-95 m-auto">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center"></div>
        }
      >
        <Router>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/create-account-default">
              <CreateAccount />
            </Route>
            <Route exact path="/create-account-with-current-seed">
              <WithCurrentSeed />
            </Route>
            <Route exact path="/create-account-new-seed-phrase">
              <NewSeed />
            </Route>
            <Route exact path="/create-account-confirm-seed-phrase">
              <ConfirmSeed />
            </Route>
            <Route exact path="/unlock">
              <Unlock />
            </Route>
            <Route exact path="/welcome">
              <Welcome />
            </Route>
            <Route exact path="/set-password">
              <SetPassword />
            </Route>
            <Route exact path="/select-create-type">
              <SelectCreateType />
            </Route>
            <Route exact path="/import-account/:pattern">
              <ImportAccount />
            </Route>
            {/* TODO: Replace with 404 page */}
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </Router>
      </Suspense>
    </div>
  )
}

export default App
