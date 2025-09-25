import Button from '@mui/material/Button';
// importing types
import type { SubmitButtonProps } from '../../types';

export const SubmitButton = (props: SubmitButtonProps) => {
    const { label, submitting } = props;

    return (
        <Button
            type='submit'
            variant='contained'
            disabled={submitting}
            fullWidth
            color='primary'
            sx={{ mt: 5 }}
        >
            {label}
        </Button>
    );
};