import TextEditor from "./TextEditor";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Navigate component
import { v4 as uuidv4 } from 'uuid';

function App() {
  const dynamicUuid = uuidv4();

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to={`documents/${dynamicUuid}`} />} />
        <Route path='/documents/:id' element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
