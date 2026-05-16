import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

document.title = 'NymFit';
// Keep title as NymFit regardless of any platform overrides
const observer = new MutationObserver(() => {
  if (document.title !== 'NymFit') document.title = 'NymFit';
});
observer.observe(document.querySelector('title') || document.head, { subtree: true, childList: true, characterData: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)