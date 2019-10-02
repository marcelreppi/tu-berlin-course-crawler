if (!window.scriptHasRun) {
  // Make sure script only runs once!
  window.scriptHasRun = true

  let resourceNodes = []

  browser.runtime.onMessage.addListener(message => {
    if (message.command === "scan") {
      resourceNodes = []
      document.querySelectorAll("a").forEach(node => {
        if (node.href.startsWith("https://isis.tu-berlin.de/mod/resource/view.php?id=")) {
          resourceNodes.push(node)
        }
      })

      browser.runtime.sendMessage({
        command: "scan-result",
        numberOfResources: resourceNodes.length,
      })

      return
    }

    if (message.command === "crawl") {
      resourceNodes.forEach(node => {
        // Fetch the href to get the actual download URL
        fetch(node.href).then(res => {
          // Content script can't access downloads API -> send msg to background script
          browser.runtime.sendMessage({
            command: "download",
            url: res.url,
            // If checkbox was ticked parse the ISIS filename from DOM through the children
            ISISFilename: message.useISISFilename ? node.children[1].firstChild.textContent : null,
          })
        })
      })

      return
    }
  })
}
