import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
// importing features
import { optimisticUpdateSetting, updateSetting } from '../../../user';
// importing types
import type { ChangeEvent } from 'react';
import type { AppDispatch, RootState } from '../../../../types';
import type { SettingCheckBoxProps } from '../../types';

export const SettingCheckBox = (props: SettingCheckBoxProps) => {
    const { label, name, description, disabled = false, ...rest } = props;

    const dispatch = useDispatch<AppDispatch>();

    const setting = useSelector((state: RootState) => state.user.user.setting);

    const updateCheckboxSetting = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        const updatedSetting = _.set(_.cloneDeep(setting), name, checked);

        dispatch(optimisticUpdateSetting(updatedSetting));
        dispatch(updateSetting({ newSetting: updatedSetting }));
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
            <Box>
                <Typography>{label}</Typography>
                <Typography variant='subtitle1' color='text.secondary' fontSize='small'>{description}</Typography>
            </Box>
            <Switch
                name={name}
                disabled={disabled}
                checked={Boolean(_.get(setting, name))}
                onChange={updateCheckboxSetting}
                {...rest}
            />
        </Box>
    );
};