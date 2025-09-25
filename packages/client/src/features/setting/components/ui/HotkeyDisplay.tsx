import { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// importing icons
import InfoIcon from '@mui/icons-material/Info';
// importing types
import type { HotkeyDisplayProps } from '../../types';
// importing components
import { ToolTip } from '../../../../components/ToolTip';

export const HotkeyDisplay = (props: HotkeyDisplayProps) => {
    const { text, binding, last = false, info } = props;
    const [hover, setHover] = useState(false);

    return (
        <>
            <Box
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <Typography>{text}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 0.5 }}>
                    {hover && info &&
                        <ToolTip title={info}>
                            <InfoIcon fontSize='small' sx={{ color: 'text.secondary', cursor: 'pointer' }} />
                        </ToolTip>
                    }
                    <Typography sx={{ bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 1, fontFamily: 'monospace' }}>
                        {binding}
                    </Typography>
                </Box>
            </Box>
            {!last && <Divider />}
        </>
    );
};