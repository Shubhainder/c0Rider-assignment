import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, theme } from '@chakra-ui/react'
import App from './App'
import './index.css'


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { type: 'module' })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)