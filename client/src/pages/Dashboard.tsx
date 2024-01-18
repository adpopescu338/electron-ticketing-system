import { useCtx } from '../lib/Ctx';
import { Button, Link } from '@mui/material';

export const Dashboard = () => {
  const { queuesSettings } = useCtx();

  if (!queuesSettings.length) {
    return <div>There are no queues to display</div>;
  }

  return (
    <div>
      <h1>Select a queue</h1>
      {queuesSettings.map((queue) => {
        return (
          <Link key={queue.name} href={`/next/${queue.name}`}>
            <Button variant="contained">{queue.name}</Button>
          </Link>
        );
      })}
    </div>
  );
};
