import { SelectQueues } from './SelectQueues';
import { Button, Typography } from '@mui/material';
import { DisplaySettings } from './DisplaySettings';
import TvIcon from '@mui/icons-material/Tv';
import React from 'react';
import { QueueDisplaySettings } from '@repo/types';
import { areWeInElectron } from 'lib/areWeInElectron';

export const Components: React.FC<{
  step: number;
  increaseStep: () => void;
  selectedQueues: string[];
  setSelectedQueues: React.Dispatch<React.SetStateAction<string[]>>;
  decreaseStep: () => void;
}> = ({ step, increaseStep, selectedQueues, setSelectedQueues, decreaseStep }) => {
  const [settingsStep, setSettingsStep] = React.useState(0);
  const [updatedSettings, setUpdatedSettings] = React.useState<QueueDisplaySettings[]>([]);

  if (step === 0) {
    return (
      <SelectQueues
        selectedQueues={selectedQueues}
        increaseStep={increaseStep}
        setSelectedQueues={setSelectedQueues}
      />
    );
  }

  if (step === 1) {
    return (
      <DisplaySettings
        step={settingsStep}
        decreaseStep={() => setSettingsStep((p) => p - 1)}
        increaseStep={() => setSettingsStep((p) => p + 1)}
        onSubmit={(newSettings) => {
          setUpdatedSettings(newSettings);
          increaseStep();
        }}
        queueNames={selectedQueues}
        back={decreaseStep}
      />
    );
  }

  const launch = () => {
    const id = Math.random().toString(36).substring(7);

    sessionStorage.setItem(id, JSON.stringify(updatedSettings));
    window.open(`/display/custom/${id}`, '_blank');
  };

  const text = areWeInElectron()
    ? `In the display window, press 'esc' to close the window.`
    : `In the display window, press 'f' to toggle full screen. Press 'esc' to exit full screen, or
        to close the display window.`;

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px',
      }}
    >
      <Button size="large" variant="contained" onClick={launch} endIcon={<TvIcon />}>
        Launch display in a separate window
      </Button>
      <Typography variant="caption" style={{ display: 'block', marginTop: '10px' }}>
        {text}
      </Typography>
    </div>
  );
};
