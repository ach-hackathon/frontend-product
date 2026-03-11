import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGuard, CodeSentPage, ConfirmCodePage, LoginPage, UserProvider } from './auth'
import { Layout } from './components/Layout/Layout'
import { ErrorPage } from './pages/ErrorPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — без layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/code/confirm" element={<ConfirmCodePage />} />
        <Route path="/code/sent" element={<CodeSentPage />} />
        <Route path="/error" element={<ErrorPage />} />

        {/* Защищённые страницы с общим layout */}
        <Route element={<AuthGuard />}>
          <Route element={<UserProvider />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
