import { Button, Grid, Link } from '@mui/material';

export const Admin = () => {
  return (
    <Grid container direction="column" justifyContent="center" gap={2}>
      <Link href="/display">
        <Button variant="contained">Display</Button>
      </Link>
      <Link href="/configure-queues">
        <Button variant="contained">Configure Queues</Button>
      </Link>
      <Link href="/display-settings">
        <Button variant="contained">Display Settings</Button>
      </Link>
    </Grid>
  );
};
