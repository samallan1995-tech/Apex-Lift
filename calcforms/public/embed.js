;(function () {
  'use strict'

  function init(script) {
    var formSlug = script.getAttribute('data-form')
    var containerId = 'calcform-' + formSlug
    var container = document.getElementById(containerId)
    if (!container || !formSlug) return

    var appUrl = script.src.replace('/embed.js', '')

    var iframe = document.createElement('iframe')
    iframe.src = appUrl + '/f/' + formSlug + '?embed=1'
    iframe.style.width = '100%'
    iframe.style.border = 'none'
    iframe.style.borderRadius = '12px'
    iframe.style.minHeight = '500px'
    iframe.setAttribute('scrolling', 'no')
    iframe.setAttribute('frameborder', '0')
    iframe.title = 'CalcForms'

    container.appendChild(iframe)

    // Auto-resize via postMessage
    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'calcforms-resize' && event.data.slug === formSlug) {
        iframe.style.height = event.data.height + 'px'
      }
    })
  }

  // Find all embed scripts on the page
  var scripts = document.querySelectorAll('script[data-form]')
  for (var i = 0; i < scripts.length; i++) {
    init(scripts[i])
  }

  // Also run for the current script if it has data-form
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()

  if (currentScript && currentScript.getAttribute('data-form')) {
    init(currentScript)
  }
})()
