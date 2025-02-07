import browser from 'webextension-polyfill'
import {isFunction} from '@fluent-wallet/checks'

// TODO, hardcode is not accurate, need to find more effective way
const POPUP_HEIGHT = 628
const POPUP_WIDTH = 372
let FOCUS_LISTENER = null
let REMOVED_LISTENER = null

const focus = async wid => {
  if (!FOCUS_LISTENER) {
    FOCUS_LISTENER = () => focus(wid)
    REMOVED_LISTENER = removedWId => {
      if (removedWId === wid) {
        browser.windows.onFocusChanged.hasListener(FOCUS_LISTENER) &&
          browser.windows.onFocusChanged.removeListener(FOCUS_LISTENER)
        FOCUS_LISTENER = null
        browser.windows.onRemoved.hasListener(REMOVED_LISTENER) &&
          browser.windows.onRemoved.removeListener(REMOVED_LISTENER)
        REMOVED_LISTENER = null
      }
    }

    browser.windows.onRemoved.addListener(REMOVED_LISTENER)
    browser.windows.onFocusChanged.addListener(FOCUS_LISTENER)
  } else {
    try {
      const w = await browser.windows.get(wid)
      if (w) {
        await browser.windows.update(wid, {focused: true})
      }
    } catch (err) {
      if (FOCUS_LISTENER) {
        browser.windows.onFocusChanged.hasListener(FOCUS_LISTENER) &&
          browser.windows.onFocusChanged.removeListener(FOCUS_LISTENER)
        FOCUS_LISTENER = null
      }
    }
  }
}

const newPopup = async ({url, alwaysOnTop}) => {
  const lastFocused = await browser.windows
    .getLastFocused({windowTypes: ['normal']})
    .catch(() => {})

  const w = await browser.windows.create({
    type: 'popup',
    focused: true,
    url,
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    left: lastFocused?.left,
    top: lastFocused?.top,
  })

  alwaysOnTop && focus(w.id)

  return w
}

export const show = async ({url, alwaysOnTop = false, mode = {}} = {}) => {
  url = url || (mode.isProd ? 'popup/notification.html' : 'notification.html')
  if (!browser?.windows?.getAll) return
  let popup = (await browser.windows.getAll()).filter(
    w => w.type === 'popup',
  )?.[0]
  if (popup) {
    await browser.windows.update(popup.id, {focused: true})
  } else {
    popup = await newPopup({url, alwaysOnTop})
  }
  return popup
}

export const removePopup = async () => {
  if (!browser?.windows?.getAll) return
  try {
    const popup = (await browser.windows.getAll()).filter(
      w => w.type === 'popup',
    )?.[0]

    if (popup) {
      await remove(popup.id)
    }
    return true
  } catch (err) {} // eslint-disable-line no-empty
  return false
}

let ON_FOCUS_CHANGED = []
let ON_REMOVED = []

if (browser?.windows?.onFocusChanged) {
  browser.windows.onFocusChanged.addListener(id => {
    ON_FOCUS_CHANGED = ON_FOCUS_CHANGED.reduce((acc, f) => {
      try {
        const dontRemoveListener = f(id)
        if (dontRemoveListener) return acc.concat(f)
      } catch (err) {} // eslint-disable-line no-empty

      return acc
    }, [])
  })

  browser.windows.onRemoved.addListener(id => {
    ON_REMOVED = ON_REMOVED.reduce((acc, f) => {
      try {
        const dontRemoveListener = f(id)
        if (dontRemoveListener === true) return acc.concat(f)
      } catch (err) {} // eslint-disable-line no-empty

      return acc
    }, [])
  })
}
export const onFocusChanged = (windowId, f) => {
  if (!isFunction(f)) throw new Error('Invalid callback, must be a function')
  ON_FOCUS_CHANGED.push(id => {
    if (windowId === id) {
      return f(id)
    }
    return true
  })
}

export const onRemoved = (windowId, f) => {
  if (!isFunction(f)) throw new Error('Invalid callback, must be a function')
  ON_REMOVED.push(id => {
    if (windowId === id) {
      return f(id)
    }
    return true
  })
}

export const remove = browser.windows?.remove
