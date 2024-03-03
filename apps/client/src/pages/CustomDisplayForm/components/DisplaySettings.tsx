import { useCtx } from 'hooks/useCtx';
import { QueueDisplaySettings } from '@repo/types';
import { QueueSettings } from '../../QueueSettings';
import React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { BackButton } from './BackButton';

export const DisplaySettings: React.FC<{
  onSubmit: (settings: QueueDisplaySettings[]) => void;
  queueNames: string[];
  back: () => void;
  step: number;
  increaseStep: () => void;
  decreaseStep: () => void;
}> = ({ onSubmit, queueNames, back, step, increaseStep, decreaseStep }) => {
  const { queuesSettings: initialSettings } = useCtx();
  const [settings, setSettings] = React.useState<QueueDisplaySettings[]>(
    initialSettings.filter((setting) => queueNames.includes(setting.name))
  );

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

          if (i === self.length - 1) {
            onSubmit(newSettings);
          } else {
            increaseStep();
          }
        }}
      />
    );
  });

  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={step} alternativeLabel>
          {queueNames.map((queueName) => (
            <Step key={queueName}>
              <StepLabel>{queueName}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      {components[step]}

      <BackButton step={step} decreaseStep={decreaseStep} neverDisabled on0Click={back} />
    </div>
  );
};
