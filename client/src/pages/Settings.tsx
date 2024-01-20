import { useCtx } from 'hooks/useCtx';
import { IconButton, Link, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TvIcon from '@mui/icons-material/Tv';
import DeleteIcon from '@mui/icons-material/Delete';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import TuneIcon from '@mui/icons-material/Tune';
import styled from 'styled-components';
import swal from 'sweetalert';
import axios from 'axios';

const QueueOptions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const QueueOptionsContainer = styled.div`
  width: 40%;
  text-align: center;
  margin: 0 auto;
  box-shadow: 0 0 5px 0 black;
  border-radius: 5px;
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0 0 10px 0 black;
    scale: 1.05;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`;

export const Settings: React.FC = () => {
  const { queuesSettings, refetchQueuesSettings } = useCtx();

  const handleDelete = async (queueName: string) => {
    const proceed = await swal({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${queueName}?`,
      icon: 'warning',
      buttons: ['Cancel', 'Delete'],
      dangerMode: true,
    });

    if (!proceed) return;

    try {
      await axios.delete(`/api/q/${queueName}`);
      refetchQueuesSettings();
      swal('Success', 'Queue deleted', 'success');
    } catch (error) {
      swal('Error', 'Something went wrong', 'error');
    }
  };

  return (
    <Container>
      <Typography variant="h4">Queue Settings</Typography>
      <Typography variant="body1">Here you can edit your queues and create new ones.</Typography>
      {queuesSettings.map((queue) => (
        <QueueOptionsContainer key={queue.name}>
          <Typography variant="h5">{queue.name}</Typography>

          <QueueOptions>
            <Link href={`/queue/${queue.name}`}>
              <IconButton color="primary">
                Edit settings&nbsp;
                <EditIcon />
              </IconButton>
            </Link>

            <Link href={`/display/${queue.name}`} target="_blank">
              <IconButton color="primary">
                Display&nbsp;
                <TvIcon />
              </IconButton>
            </Link>

            <Link href={`/next/${queue.name}`}>
              <IconButton color="primary">
                Open&nbsp;
                <QueuePlayNextIcon />
              </IconButton>
            </Link>

            <IconButton color="error" onClick={() => handleDelete(queue.name)}>
              Delete&nbsp;
              <DeleteIcon />
            </IconButton>
          </QueueOptions>
        </QueueOptionsContainer>
      ))}

      <Link href="/queue/_new">
        <IconButton color="primary">
          <AddCircleIcon />
          Create new queue
        </IconButton>
      </Link>

      <Link href="/display" target="_blank">
        <IconButton color="primary">
          Display all&nbsp;
          <QueuePlayNextIcon />
        </IconButton>
      </Link>

      <div>
        <Link href="/custom-display">
          <IconButton color="primary">
            Create a personalized display for this session only&nbsp;
            <TuneIcon />
          </IconButton>
        </Link>

        <Typography variant="body1">
          This will not save your settings, but you can use it to display your queues in a
          personalized way. You will be able to select which queues to display and customize their
          appearance.
        </Typography>
      </div>
    </Container>
  );
};
