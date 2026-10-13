import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './authContext/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
)


// https://vm-8fst0ldc2m33iuy8k2tfct6f.vusercontent.net/
