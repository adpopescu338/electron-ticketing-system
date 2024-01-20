import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import styled from 'styled-components';

const Div = styled.div`
  text-align: left;
  margin-top: 20px;
`;

export const BackButton: React.FC<{
  step: number;
  decreaseStep: () => void;
  neverDisabled?: boolean;
  on0Click?: () => void;
}> = ({ step, decreaseStep, neverDisabled, on0Click }) => {
  return (
    <Div>
      <Button
        disabled={neverDisabled ? false : step === 0}
        onClick={() => {
          if (step === 0 && on0Click) {
            on0Click();
          } else {
            decreaseStep();
          }
        }}
      >
        <ArrowBackIcon />
      </Button>
    </Div>
  );
};
