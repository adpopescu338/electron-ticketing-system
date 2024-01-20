import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Display, Next, Settings, QueueSettings, DisplayQueue, CustomDisplay } from './pages';
import isValidProp from '@emotion/is-prop-valid';
import { StyleSheetManager } from 'styled-components';
import { CtxProvider } from './components/Ctx';

function App() {
  return (
    <CtxProvider>
      <StyleSheetManager shouldForwardProp={isValidProp}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Settings />} />
            <Route path="/display" element={<Display />} />
            <Route path="/display/:queueName" element={<DisplayQueue />} />
            <Route path="/display/custom/:customDisplayId" element={<Display />} />
            <Route path="/next/:queueName" element={<Next />} />
            <Route path="/queue/:queueName" element={<QueueSettings />} />
            <Route path="/custom-display" element={<CustomDisplay />} />
          </Routes>
        </BrowserRouter>
      </StyleSheetManager>
    </CtxProvider>
  );
}

export default App;
