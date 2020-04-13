export function setClicked(button) {
  button.classList.add('active')
  button.setAttribute('aria-pressed', 'true')
}

export function setUnclicked(button) {
  button.classList.remove('active')
  button.setAttribute('aria-pressed', 'false')
}