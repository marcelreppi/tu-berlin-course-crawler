import { apiUrl, apiKey } from "./env.js"
import { isFirefox } from "../shared/helpers"

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  )
}

browser.runtime.onInstalled.addListener(details => {
  switch (details.reason) {
    case "install":
      const randomId = uuidv4()
      browser.storage.local
        .set({
          browserId: randomId,
        })
        .then(() => {
          sendEvent("install")
        })
      browser.tabs.create({
        url: "/pages/install/install.html",
      })

      break
    case "update":
      browser.tabs.create({
        url: "/pages/update/update.html",
      })
      sendEvent("update")
      break
    default:
      break
  }
})

browser.runtime.onMessage.addListener(async message => {
  if (message.command === "event") {
    sendEvent(message.event)
  }
})

async function sendEvent(event) {
  const { options, browserId } = await browser.storage.local.get(["options", "browserId"])

  if (options && options.disableInteractionTracking) {
    if (!(event === "install" || event === "update")) {
      // Excluding install and update events
      console.log("Tracking disabled!")
      return
    }
  }

  if (apiUrl === undefined || apiKey === undefined) {
    return
  }

  console.log("sendEvent", {
    event,
    browser: isFirefox() ? "firefox" : "chrome",
    browserId,
  })
  return

  fetch(apiUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      // "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      event,
      browser: isFirefox() ? "firefox" : "chrome",
      browserId,
      // test: true,
    }),
  })
    .then(res => console.log(res.status))
    .catch(error => console.log(error))
}
