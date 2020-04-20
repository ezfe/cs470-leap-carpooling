'use strict'

document.getElementById('cancel-trip-form').addEventListener('submit', (evt) => {
  if (!confirm('This will completely remove your trip request and matching.\n\nIf you want to be paired with someone else, stop and click Reject Match instead.')) {
      evt.preventDefault()
    }
})

document.getElementById('confirm-trip-form').addEventListener('submit', (evt) => {
  
})