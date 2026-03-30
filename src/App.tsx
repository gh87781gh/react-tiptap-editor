import './App.css'
import './styles/_variables.scss'
import './styles/_keyframe-animations.scss'
import { useState } from 'react'
import { TiptapEditor } from './components/tiptap-templates/simple/simple-editor'

function App() {
  const [value, setValue] = useState('<p>Hello</p>')
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <TiptapEditor
        id="dev"
        value={value}
        onChange={setValue}
      />
    </div>
  )
}

export default App
