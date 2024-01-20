import { useCtx } from 'hooks/useCtx';
import { QBoxContainer } from '../components/QBox/QBox';
import { useParams } from 'react-router-dom';
import { DisplayWrapper } from 'components/DisplayWrapper';

/**
 * Display a single queue
 */
export const DisplayQueue = () => {
  const { queuesSettings } = useCtx();
  const { queueName } = useParams();

  const queue = queuesSettings.find((queue) => queue.name === queueName);

  if (!queue) {
    return <div>Queue not found</div>;
  }

  return (
    <DisplayWrapper columns={1}>
      <QBoxContainer settings={queue} />
    </DisplayWrapper>
  );
};
