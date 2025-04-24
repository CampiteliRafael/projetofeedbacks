import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // 1. Importe o BrowserRouter
import { AuthProvider } from '../src/context/AuthContext.tsx'; // 2. Importe o AuthProvider (ajust
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <BrowserRouter>  
      <AuthProvider>  
        <App />       
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
