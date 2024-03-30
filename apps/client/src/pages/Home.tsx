import { useCtx } from 'hooks/useCtx';
import { IconButton, Link, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TvIcon from '@mui/icons-material/Tv';
import DeleteIcon from '@mui/icons-material/Delete';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import styled from 'styled-components';
import swal from 'sweetalert';
import axios from 'axios';
import { AddressDisplayer } from 'components/AddressDisplayer';

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
  align-items: center;
  gap: 30px;
  padding: 10px;
  padding-bottom: 100px;
`;

const linkStyle = {
  width: 'fit-content',
};

const displayIntructions =
  "Press 'f' to toggle full screen. Press 'esc' to exit full screen, or to close the display.";

export const Home: React.FC = () => {
  const { queuesSettings = [], refetchQueuesSettings } = useCtx();

  const hasQ = !!queuesSettings?.length;

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

  const handleDeleteEverything = async () => {
    const proceed = await swal({
      title: 'Are you sure?',
      text: `Are you sure you want to delete everything?`,
      icon: 'warning',
      buttons: ['Cancel', 'Delete'],
      dangerMode: true,
    });

    if (!proceed) return;

    try {
      await axios.delete(`/api/all`);
      refetchQueuesSettings();
      swal('Success', 'Everything deleted', 'success');
    } catch (error) {
      swal('Error', 'Something went wrong', 'error');
    }
  };

  return (
    <Container>
      <AddressDisplayer />
      <Typography variant="h4">Queue Settings</Typography>
      <Typography variant="body1">Here you can edit your queues and create new ones.</Typography>
      {queuesSettings.map((queue) => (
        <QueueOptionsContainer key={queue.name}>
          <Typography variant="h5">{queue.name}</Typography>

          <QueueOptions>
            <Tooltip title="Configure this queue settings.">
              <Link href={`/queue/${queue.name}`}>
                <IconButton color="primary">
                  Edit settings&nbsp;
                  <EditIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title={`Open this queue in a new display tab. ${displayIntructions}`}>
              <Link href={`/display/${queue.name}`} target="_blank">
                <IconButton color="primary">
                  Display&nbsp;
                  <TvIcon />
                </IconButton>
              </Link>
            </Tooltip>

            <Tooltip title="Open the page where you can interact with this queue, by calling the next number, etc.">
              <Link href={`/next/${queue.name}`}>
                <IconButton color="primary">
                  Open&nbsp;
                  <QueuePlayNextIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title="Delete this queue permanently. This action cannot be undone.">
              <IconButton color="error" onClick={() => handleDelete!(queue.name)}>
                Delete&nbsp;
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </QueueOptions>
        </QueueOptionsContainer>
      ))}

      <Tooltip title="Create a new queue. You will be able to customize the default settings">
        <Link href="/queue/_new" sx={linkStyle}>
          <IconButton color="primary">
            Create new queue&nbsp;
            <AddCircleIcon />
          </IconButton>
        </Link>
      </Tooltip>

      {hasQ && (
        <Tooltip title={`Open all queues in a new display tab. ${displayIntructions}`}>
          <Link href="/display" target="_blank" sx={linkStyle}>
            <IconButton color="primary">
              Display all&nbsp;
              <QueuePlayNextIcon />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      {hasQ && (
        <Tooltip title="This will not save your settings, but you can use it to display your queues in a personalized way. You will be able to select which queues to display and customize their appearance.">
          <Link href="/custom-display" sx={linkStyle}>
            <IconButton color="primary">
              Create a personalized display for this session only&nbsp;
              <TuneIcon />
            </IconButton>
          </Link>
        </Tooltip>
      )}

      <Tooltip title="Edit system settings, like number or message duration, max or min number (like 0 and 99), etc.">
        <Link href="/system-settings" sx={linkStyle}>
          <IconButton color="primary">
            Edit system settings&nbsp;
            <SettingsIcon />
          </IconButton>
        </Link>
      </Tooltip>
      <Tooltip title="This will delete all the application data.">
        <IconButton color="error" onClick={handleDeleteEverything}>
          Delete all data&nbsp;
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Container>
  );
};
