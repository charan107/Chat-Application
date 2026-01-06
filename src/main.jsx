import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {ChatProvider} from './context/ChatContext.jsx'
import {AuthProvider} from './context/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
