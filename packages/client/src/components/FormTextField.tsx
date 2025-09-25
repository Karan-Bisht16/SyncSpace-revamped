import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { FormTextFieldProps } from '../types';
// importing hooks
import { useDebounce } from '../hooks/useDebouce';

export const FormTextField = (props: FormTextFieldProps) => {
    const { data, label, name, ...rest } = props;

    return (
        <Box sx={{ position: 'relative', width: '100%', pb: 1.25 }}>
            <CustomTextField name={name} label={label} data={data} {...rest} />
            {data.error &&
                <FormHelperText error sx={{ position: 'absolute', bottom: -12, left: 14, fontSize: '0.75rem' }}>
                    {data.error}
                </FormHelperText>
            }
        </Box>
    );
};

const CustomTextField = (props: FormTextFieldProps) => {
    const { name, label, data, submitting, required, dispatch, validate, sx, ...rest } = props;

    const { debounce } = clientConfig;

    const validateTextField = async () => {
        if (!validate || !dispatch || !data.value) {
            return;
        }

        const result = await validate(data.value);
        if (typeof result === 'object') {
            dispatch({ type: 'SET_ERROR', field: name, error: result.message });
        } else if (data.error) {
            dispatch({ type: 'SET_ERROR', field: name, error: '' });
        }
    }

    useDebounce(() => {
        validateTextField();
    }, [data.value], debounce.textField);

    const getLabel = () => {
        if (!required) {
            return label;
        }

        return (
            <>
                {label}
                <Typography component='span' color='error'>&nbsp;*</Typography>
            </>
        );
    };

    return (
        <TextField
            id={name}
            name={name}
            label={getLabel()}
            value={data.value}
            error={!!data.error}
            disabled={submitting}
            autoComplete='off'
            variant='outlined'
            margin='none'
            fullWidth
            sx={{
                '.MuiOutlinedInput-input:disabled': { cursor: submitting ? 'wait' : 'text' },
                ...sx
            }}
            {...rest}
        />
    );
};