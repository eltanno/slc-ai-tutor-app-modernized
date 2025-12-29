import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './app/App.tsx'

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
}else{
  throw new Error('Root element not found');
}
