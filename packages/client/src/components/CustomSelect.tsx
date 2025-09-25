import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
// importing types
import type { CustomSelectProps } from '../types';

export const CustomSelect = (props: CustomSelectProps) => {
    const { id, name, value, onChange, list, label, maxHeight = 300, disabled = false } = props;

    const [searchQuery, setSearchQuery] = useState('');
    const filteredList = list.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isValueInFilteredList = filteredList.some(item => item.value === value);

    return (
        <FormControl fullWidth size='small'>
            {label && (
                <InputLabel>{label}</InputLabel>
            )}
            <Select
                id={`${id}-select`}
                labelId={`${id}-select-label`}
                name={name}
                value={value}
                label={label}
                sx={{ color: 'text.primary' }}
                onChange={onChange}
                MenuProps={{
                    PaperProps: {
                        style: { maxHeight: maxHeight },
                    },
                    disablePortal: true,
                    MenuListProps: { autoFocusItem: false },
                }}
                disabled={disabled}
            >
                <ListSubheader sx={{ bgcolor: 'inherit' }}>
                    <TextField
                        fullWidth
                        size='small'
                        autoFocus={true}
                        placeholder='Search...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        sx={{ bgcolor: 'action.hover' }}
                    />
                </ListSubheader>

                {!isValueInFilteredList && (
                    <MenuItem value={value} style={{ display: 'none' }}>
                        {value}
                    </MenuItem>
                )}

                {filteredList.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};