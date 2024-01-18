import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Admin, Display, Dashboard, Next } from './pages';
import isValidProp from '@emotion/is-prop-valid';
import { StyleSheetManager } from 'styled-components';
import { CtxProvider } from './lib/Ctx';

function App() {
  return (
    <CtxProvider>
      <StyleSheetManager shouldForwardProp={isValidProp}>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/display" element={<Display />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/next/:queueName" element={<Next />} />
          </Routes>
        </BrowserRouter>
      </StyleSheetManager>
    </CtxProvider>
  );
}

export default App;
