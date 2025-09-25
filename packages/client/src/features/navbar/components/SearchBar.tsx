import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
// importing icons
import SearchIcon from '@mui/icons-material/Search';
// importing types
import type { SearchBarProps } from '../types';

export const SearchBar = (props: SearchBarProps) => {
    const { sx } = props;

    return (
        <TextField
            placeholder='Search'
            variant='outlined'
            size='small'
            margin='none'
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position='start'>
                            <SearchIcon fontSize='small' sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    ),
                    sx: { minWidth: '640px', borderRadius: 8, ...sx }
                },
            }}
        />
    );
};