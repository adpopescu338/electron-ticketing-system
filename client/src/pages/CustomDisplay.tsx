import { useCtx } from 'hooks/useCtx';
import React, { useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Button, Link } from '@mui/material';
import { QueueDisplaySettings } from '../../../types';
import { QueueSettings } from './QueueSettings';
import TvIcon from '@mui/icons-material/Tv';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styled from 'styled-components';

const SelectQueues: React.FC<{
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
    <form onSubmit={handleSubmit}>
      <Autocomplete
        filterSelectedOptions
        multiple
        options={queueNames}
        getOptionLabel={(option) => option}
        onChange={(e, value) => setSelectedQueues(value)}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Queues" placeholder="Queues" />
        )}
      />

      <Button disabled={!selectedQueues.length} type="submit">
        Submit
      </Button>
    </form>
  );
};

const DisplaySettings: React.FC<{
  onSubmit: (settings: QueueDisplaySettings[]) => void;
  queueNames: string[];
}> = ({ onSubmit, queueNames }) => {
  const { queuesSettings: initialSettings } = useCtx();
  const [settings, setSettings] = React.useState<QueueDisplaySettings[]>(
    initialSettings.filter((setting) => queueNames.includes(setting.name))
  );
  const [step, setStep] = React.useState(0);

  const components = queueNames.map((queueName, i, self) => {
    const queueSettingsIndex = settings.findIndex((setting) => setting.name === queueName);

    return (
      <QueueSettings
        key={queueName}
        queueName={queueName}
        onSubmit={(updatedSettings) => {
          const newSettings = [...settings];
          newSettings[queueSettingsIndex] = updatedSettings;
          setSettings(newSettings);
          setStep((prev) => prev + 1);
          if (i === self.length - 1) {
            onSubmit(newSettings);
          }
        }}
      />
    );
  });

  return <div>{components[step]}</div>;
};

const Wrapper = styled.div`
  width: 60%;
  min-width: 500px;
  max-width: 850px;
  margin: 0 auto;
  border: 1px solid black;
  border-radius: 5px;
  padding: 10px;
`;

export const CustomDisplay: React.FC = () => {
  const [step, setStep] = React.useState(0);
  const [selectedQueues, setSelectedQueues] = React.useState<string[]>([]);
  const id = useMemo(() => Math.random().toString(36).substring(2, 9), []);

  const components = [
    <SelectQueues
      selectedQueues={selectedQueues}
      increaseStep={() => setStep(1)}
      setSelectedQueues={setSelectedQueues}
    />,
    <DisplaySettings
      onSubmit={(updatedSettings) => {
        console.log('updatedSettings', updatedSettings);
        localStorage.setItem(id, JSON.stringify(updatedSettings));
        setStep(2);
      }}
      queueNames={selectedQueues}
    />,
    <Link href={`/display/custom/${id}`} target="_blank">
      <Button size="large" variant="contained">
        Launch&nbsp;
        <TvIcon />
      </Button>
    </Link>,
  ];

  return (
    <Wrapper>
      {components[step]}

      <BackButton step={step} setStep={setStep} />
    </Wrapper>
  );
};

const BackButton: React.FC<{
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}> = ({ step, setStep }) => {
  return (
    <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
      <ArrowBackIcon />
    </Button>
  );
};
