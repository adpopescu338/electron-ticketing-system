import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Display,
  Next,
  Home,
  QueueSettings,
  DisplayQueue,
  CustomDisplay,
  SystemSettings,
} from './pages';
import isValidProp from '@emotion/is-prop-valid';
import { StyleSheetManager } from 'styled-components';
import { CtxProvider } from './components/Ctx';
import { GlobalBackButton } from './components/GlobalBackButton';
import { Footer } from './components/Footer';
import { GlobalContainer } from 'components/Wrapper';

function App() {
  return (
    <GlobalContainer>
      <CtxProvider>
        <StyleSheetManager shouldForwardProp={isValidProp}>
          <BrowserRouter>
            <GlobalBackButton />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/display" element={<Display />} />
              <Route path="/display/:queueName" element={<DisplayQueue />} />
              <Route path="/display/custom/:customDisplayId" element={<Display />} />
              <Route path="/next/:queueName" element={<Next />} />
              <Route path="/queue/:queueName" element={<QueueSettings />} />
              <Route path="/custom-display" element={<CustomDisplay />} />
              <Route path="/system-settings" element={<SystemSettings />} />
            </Routes>
          </BrowserRouter>
        </StyleSheetManager>
      </CtxProvider>
      <Footer />
    </GlobalContainer>
  );
}

export default App;
