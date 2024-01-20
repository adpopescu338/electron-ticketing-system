import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useCtx } from 'hooks/useCtx';
import { Button } from '@mui/material';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

export const SelectQueues: React.FC<{
  setSelectedQueues: React.Dispatch<React.SetStateAction<string[]>>;
  selectedQueues: string[];
  increaseStep: () => void;
}> = ({ setSelectedQueues, selectedQueues, increaseStep }) => {
  const { queuesSettings } = useCtx();

  const queueNames = queuesSettings.map((queue) => queue.name);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSelectedQueues(selectedQueues);
    increaseStep();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Autocomplete
        filterSelectedOptions
        multiple
        options={queueNames}
        getOptionLabel={(option) => option}
        onChange={(e, value) => setSelectedQueues(value)}
        value={selectedQueues}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Queues"
            placeholder="Queues"
            helperText="Select the queues you want to display."
          />
        )}
      />

      <Button disabled={!selectedQueues.length} type="submit" fullWidth variant="contained">
        Submit
      </Button>
    </Form>
  );
};
