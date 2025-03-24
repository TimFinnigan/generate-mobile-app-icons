import { ChakraProvider } from '@chakra-ui/react'
import { IconGenerator } from './components/IconGenerator'

function App() {
  return (
    <ChakraProvider>
      <IconGenerator />
    </ChakraProvider>
  )
}

export default App
