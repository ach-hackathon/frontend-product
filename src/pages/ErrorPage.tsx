import { useNavigate } from 'react-router-dom'

export function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>Something went wrong</h1>
      <button onClick={() => navigate('/login')}>Go to login</button>
    </div>
  )
}
