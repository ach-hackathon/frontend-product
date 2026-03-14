import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGuard } from './providers/AuthGuard'
import { UserProvider } from './providers/UserProvider'
import { Layout } from '@/widgets/layout'
import { HomePage } from '@/pages/home'
import { ProfilePage } from '@/pages/profile'
import { EventPage } from '@/pages/event'
import { TaskPage } from '@/pages/task'
import { AchievementsPage } from '@/pages/achievements'
import { ScanPage } from '@/pages/scan'
import { LoginPage } from '@/pages/login'
import { ConfirmCodePage } from '@/pages/confirm-code'
import { CodeSentPage } from '@/pages/code-sent'
import { ErrorPage } from '@/pages/error'

export function App() {
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
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/event/:id" element={<EventPage />} />
              <Route path="/task/:id" element={<TaskPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
