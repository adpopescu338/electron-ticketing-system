import React from 'react';
import styled from 'styled-components';
import { BackButton, Components } from './components';

const Wrapper = styled.div`
  width: 60%;
  min-width: 500px;
  max-width: 850px;
  min-height: 250px;
  margin: 0 auto;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const CustomDisplay: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const [selectedQueues, setSelectedQueues] = React.useState<string[]>([]);

  return (
    <Wrapper>
      <Components
        step={step}
        increaseStep={() => setStep((prev) => prev + 1)}
        selectedQueues={selectedQueues}
        setSelectedQueues={setSelectedQueues}
        decreaseStep={() => setStep((prev) => prev - 1)}
      />
      {/* Hide if step is 1 because Components 1 has internal Back Button:*/}
      {step !== 1 && <BackButton step={step} decreaseStep={() => setStep((prev) => prev - 1)} />}
    </Wrapper>
  );
};
