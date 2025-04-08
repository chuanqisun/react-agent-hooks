import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Agent</h1>
    </>
  )
}