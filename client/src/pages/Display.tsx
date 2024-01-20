import { useCtx } from 'hooks/useCtx';
import { QBoxContainer } from '../components/QBox/QBox';
import { DisplayWrapper } from 'components/DisplayWrapper';
import { QueueDisplaySettings } from '../../../types';
import { useParams } from 'react-router-dom';
import React from 'react';

/**
 * Display all queues, or a subset of queues
 */
export const Display = () => {
  const { queuesSettings } = useCtx();
  const { customDisplayId } = useParams();

  const customDisplayList = React.useMemo(() => {
    if (!customDisplayId) {
      return null;
    }

    try {
      const lcCustomDisplays = JSON.parse(localStorage.getItem(customDisplayId) || '{}');
      return lcCustomDisplays as QueueDisplaySettings[];
    } catch (e) {
      console.log(`Error parsing custom displays`, e);
    }
  }, [customDisplayId]);

  const queuesToDisplay = customDisplayList ?? queuesSettings;

  if (!queuesToDisplay.length) {
    return <div>There are no queues to display</div>;
  }
  return (
    <DisplayWrapper columns={queuesToDisplay.length}>
      {queuesToDisplay.map((queue) => {
        return <QBoxContainer key={queue.name} settings={queue} />;
      })}
    </DisplayWrapper>
  );
};
