import { ButtonProps, Grid, Tooltip, Button } from '@mui/material';

type ButtonAction =
  | {
      onClick: () => void;
    }
  | {
      href: string;
      target?: string;
    };

type Props = {
  text: string;
  tooltipText: string;
  buttonColor?: ButtonProps['color'];
  icon: React.ReactNode;
  gridMd?: number;
  id?: string;
} & ButtonAction;

export const TooltipGridButton: React.FC<Props> = ({
  text,
  tooltipText,
  buttonColor = 'primary',
  icon,
  gridMd,
  id,
  ...rest
}) => {
  return (
    <Grid item xs={12} md={gridMd}>
      <Tooltip title={tooltipText}>
        <Button
          id={id}
          target={('target' in rest && rest.target ? rest.target : undefined) as string}
          href={('href' in rest && rest.href ? rest.href : undefined) as string}
          fullWidth
          variant="outlined"
          size="large"
          color={buttonColor}
          onClick={'onClick' in rest && rest.onClick ? rest.onClick : undefined}
          endIcon={icon}
        >
          {text}
        </Button>
      </Tooltip>
    </Grid>
  );
};
