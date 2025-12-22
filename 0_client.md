import { configureStore } from '@reduxjs/toolkit';
// importing features
import { socketReducer } from '../features/socket';
import { userReducer } from '../features/user';

export const store = configureStore({
    reducer: {
        user: userReducer,
        socket: socketReducer,
    },
});


import Box from '@mui/material/Box';
// imorting types
import type { BackDropProps } from '../types';
// imorting components
import { CenteredBox } from './CenteredBox';
// imorting hooks
import { useNoScroll } from '../hooks/useNoScroll';

export const BackDrop = (props: BackDropProps) => {
    const { opaque, children } = props;

    useNoScroll(true);

    return (
        <Box sx={{ position: 'relative', height: '100vh', width: '100vw' }}>
            <Box
                sx={{ position: 'fixed', inset: 0, zIndex: 200, opacity: opaque ? 1 : 0.5, bgcolor: 'background.default' }}
                onClick={(event) => event.stopPropagation()}
            />
            <CenteredBox sx={{
                flexDirection: 'column',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 250,
            }}>
                {children}
            </CenteredBox>
        </Box>
    );
};


import Box from '@mui/material/Box';
// importing types
import type { CenteredBoxProps } from '../types';

export const CenteredBox = <C extends React.ElementType = 'div'>(props: CenteredBoxProps<C>) => {
    const { sx, children, ...rest } = props;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...sx }} {...rest}>
            {children}
        </Box>
    );
};


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


import { useRef } from 'react';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
// importing icons
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { FileUploaderButtonParams, FileUploaderProps } from '../types';
import type { RegisterFileField } from '../features/auth/types';
// importing components
import { CenteredBox } from './CenteredBox';
import { ToolTip } from './ToolTip';

export const FileUploader = (props: FileUploaderProps) => {
    const { name, data, submitting, onUpload, dispatch, validate, ...fileProps } = props;
    const { accept, uploadIcon, size = 128, sx, ...rest } = fileProps;

    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!validate || !dispatch || !selectedFile) {
            return;
        }

        const validation = await validate(selectedFile);
        if (typeof validation === 'object') {
            dispatch({ type: 'SET_ERROR', field: name as RegisterFileField, error: validation.message });
        } else {
            dispatch({ type: 'SET_ERROR', field: name as RegisterFileField, error: '' });
            dispatch({ type: 'SET_FILE', field: name as RegisterFileField, file: selectedFile });
            onUpload?.(selectedFile);
        }
    };

    const handleFileUpload = () => {
        if (!dispatch || submitting) {
            return;
        }

        inputRef.current?.click();
        dispatch({ type: 'SET_ERROR', field: name as RegisterFileField, error: '' });
    };

    const handleResetFile = () => {
        if (!dispatch || submitting) {
            return;
        }

        dispatch({ type: 'SET_FILE', field: name as RegisterFileField, file: null });
        dispatch({ type: 'SET_ERROR', field: name as RegisterFileField, error: '' });
    };

    return (
        <CenteredBox sx={{ width: '100%', position: 'relative', py: 1.25 }}>
            <Box sx={{
                height: size,
                width: size,
                overflow: 'hidden',
                cursor: submitting ? 'wait' : 'auto',
                ...sx,
                '&:hover .file-upload-button': { opacity: 1 },
            }}>
                {data.file ?
                    <CenteredBox sx={{ gap: 1.5, height: '100%', width: '100%', position: 'relative' }}>
                        <FileUploaderButton
                            tooltip='Upload image'
                            icon={<UploadIcon fontSize='small' />}
                            submitting={submitting}
                            onClick={handleFileUpload}
                        />

                        <FileUploaderButton
                            tooltip='Delete image'
                            icon={<DeleteIcon fontSize='small' />}
                            submitting={submitting}
                            onClick={handleResetFile}
                        />

                        <img
                            src={URL.createObjectURL(data.file)}
                            alt='User uploaded'
                            style={{ height: '100%', width: '100%', position: 'absolute', zIndex: 0, objectFit: 'cover' }}
                        />
                    </CenteredBox>
                    : <label htmlFor={name} style={{ cursor: submitting ? 'wait' : 'pointer' }}>
                        {uploadIcon}
                    </label>
                }
            </Box>

            {data.error &&
                <FormHelperText error sx={{ position: 'absolute', bottom: -12, textAlign: 'center' }}>
                    {data.error}
                </FormHelperText>
            }

            <input
                id={name}
                name={name}
                type='file'
                ref={inputRef}
                disabled={submitting}
                onChange={handleFileChange}
                accept={accept}
                style={{ display: 'none' }}
                {...rest}
            />
        </CenteredBox>
    );
};

const FileUploaderButton = (props: FileUploaderButtonParams) => {
    const { tooltip, icon, submitting, onClick } = props;

    const { transitionDurationMs } = clientConfig;

    return (
        <IconButton
            className='file-upload-button'
            onClick={onClick}
            sx={{
                zIndex: 1,
                bgcolor: 'rgba(128, 128, 128, 0.75)',
                cursor: submitting ? 'wait' : 'pointer',
                transition: 'opacity ease',
                transitionDuration: `${transitionDurationMs}ms`,
                opacity: 0,
                '&:hover': { bgcolor: 'rgba(125, 125, 125, 0.95)' },
            }}>
            <ToolTip title={tooltip}>
                {icon}
            </ToolTip>
        </IconButton>
    );
};


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


import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { GenericAuthModalProps } from '../types';
// importing contexts
import { useThemeContext } from '../contexts/theme.context';
// importing components
import { CenteredBox } from './CenteredBox';
import { LordIcon } from './LordIcon';

export const GenericAuthModal = (props: GenericAuthModalProps) => {
    const { heading, subHeading, lordicon, customIcon, children, sx, ...rest } = props;

    const { transitionDurationMs } = clientConfig;

    const { designTokens } = useThemeContext();

    return (
        <Box sx={{
            display: 'flex',
            width: '28vw',
            maxWidth: '540px',
            color: 'text.primary',
            bgcolor: 'background.paper',
            px: 2,
            py: 4,
            ...sx,
        }} {...rest}>
            <CenteredBox sx={{ flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
                    <CenteredBox sx={{
                        display: 'inline-flex',
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                        mb: 1.25,
                        borderRadius: '50%',
                    }}>
                        {lordicon && (
                            <LordIcon
                                src={lordicon.src}
                                size={lordicon.size || '25px'}
                                trigger={lordicon.trigger || 'in'}
                                primary={lordicon.primary || designTokens?.palette?.primary?.contrastText}
                                secondary={lordicon.secondary || designTokens?.palette?.primary?.contrastText}
                                delay={lordicon.delay || transitionDurationMs}
                                stroke={lordicon.stroke || 'bold'}
                            />
                        )}
                        {customIcon}
                    </CenteredBox>
                    <Typography component='h3' variant='h5'>
                        {heading}
                    </Typography>
                    {subHeading && (
                        <Typography component='span' variant='caption' color='text.secondary'>
                            {subHeading}
                        </Typography>
                    )}
                </Box>
                {children}
            </CenteredBox>
        </Box>
    );
};


import { Bouncy } from 'ldrs/react';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
// importing types
import type { CircularProgressProps, LinearProgressProps } from '@mui/material';
import type { LoaderProps, LoadingModalProps } from '../types';
// importing contexts
import { useThemeContext } from '../contexts/theme.context';
// importing components
import { BackDrop } from './BackDrop';
// importing styling
import 'ldrs/react/Bouncy.css'

export const LoadingModal = (props: LoadingModalProps) => {
    const { loader, children } = props;

    return (
        <BackDrop>
            <Loader {...loader} />
            {children}
        </BackDrop>
    );
};

const Loader = (props: LoaderProps) => {
    const { progress, size = 100, color = 'primary', sx, ...rest } = props;

    const { designTokens } = useThemeContext();

    switch (progress) {
        case 'linear':
            return (
                <LinearProgress
                    color={color}
                    sx={{ width: size, mb: 1.125, ...sx }}
                    {...rest as LinearProgressProps}
                />
            );
        case 'circular':
            return (
                <CircularProgress
                    size={size}
                    color={color}
                    sx={{ mb: 1.125, ...sx }}
                    {...rest as CircularProgressProps}
                />
            );
        default:
            return (
                <Bouncy
                    size={size}
                    speed='1'
                    color={designTokens?.palette?.primary?.main}
                />
            );
    }
};


import Typography from '@mui/material/Typography';
// importing types
import type { LogoProps, LogoSvgProps, LogoTextProps } from '../types';
// importing components
import { CenteredBox } from './CenteredBox';

export const Logo = (props: LogoProps) => {
    const { logo, text, sx } = props;

    return (
        <CenteredBox sx={{ gap: 0.25, ...sx }}>
            {!logo?.hide &&
                <LogoSvg
                    size={logo?.size}
                    primary={logo?.color?.primary}
                    secondary={logo?.color?.secondary}
                    border={logo?.color?.border}
                />
            }
            {!text?.hide &&
                <CenteredBox sx={{ gap: 0.35 }}>
                    <LogoText text={{ ...text, content: 'Sync' }} />
                    <LogoText text={{ ...text, content: 'Space' }} />
                </CenteredBox>
            }
        </CenteredBox>
    );
};

const LogoSvg = (props: LogoSvgProps) => {
    const { size = '40px', primary = '#1976d2', secondary = '#0E4F76', border = '#E6EBED' } = props;

    return (
        <svg
            version='1.0'
            xmlns='http://www.w3.org/2000/svg'
            height={size}
            width={size}
            viewBox='0 0 128 128'
            preserveAspectRatio='xMidYMid meet'
        >
            <path fill={primary} d='M36.782562,28.909046 C43.770916,24.787231 50.708965,20.576666
                    57.766373,16.576694 C62.040924,14.153979 66.404892,14.680308 70.576057,17.075171 
                    C77.916039,21.289412 85.228561,25.551510 92.571220,29.761070 C97.475334,32.572613 
                    99.943222,36.766106 99.942024,42.417171 C99.940659,48.839806 99.941704,55.262440 
                    99.941704,62.577229 C86.037384,54.757122 72.812675,47.319241 58.981606,39.581062 
                    C51.177685,35.823524 43.980125,32.366287 36.782562,28.909046 z'
            />
            <path fill={primary} d='M90.449341,100.330605 C83.701920,104.280479 76.981789,108.278015 
                    70.197296,112.163147 C65.810760,114.675102 61.292747,114.723007 56.874142,112.212860 
                    C49.201843,107.854355 41.546898,103.464127 33.930202,99.009354 C29.562822,96.455002 
                    27.276745,92.519234 27.193050,87.480606 C27.082527,80.826813 27.165855,74.169807 
                    27.165855,66.558380 C40.953915,74.345741 54.180603,81.816048 68.012314,89.589355 
                    C75.894676,93.371765 83.172005,96.851189 90.449341,100.330605 z'
            />
            <path fill={secondary} d='M36.437393,28.946587 C43.980125,32.366287 51.177685,35.823524 
                    58.617844,39.482819 C54.395123,40.124947 53.173111,43.412640 52.879776,47.047550 
                    C52.399632,52.997326 52.284210,58.976528 51.937500,66.659561 C44.355145,61.455715 
                    36.608875,57.640697 30.878633,51.835636 C23.312248,44.170467 26.304821,33.681614 
                    36.437393,28.946587 z'
            />
            <path fill={secondary} d='M90.782837,100.257942 C83.172005,96.851189 75.894676,93.371765 
                    68.383636,89.686523 C72.310989,89.142479 73.822548,86.234871 74.126305,82.709801 
                    C74.666405,76.441757 74.860985,70.143944 75.257561,62.793587 C82.134460,67.218391 
                    89.224304,70.699074 94.961784,75.723915 C103.684219,83.362946 101.479301,94.975677 
                    90.782837,100.257942 z'
            />
            <path fill={border} d='M57.485565,13.231802 C62.872124,11.272013 67.694542,11.814477 
                    72.279663,14.424120 C79.509499,18.539015 86.683929,22.751284 93.916565,26.861193 
                    C100.333458,30.507555 103.289429,36.009216 103.163460,43.333809 C103.074699,48.494862 
                    103.170685,53.658817 103.143471,58.821262 C103.106918,65.754456 101.062714,66.998291 
                    95.106613,63.589527 C84.421310,57.474152 73.791573,51.261761 63.119602,45.122959 
                    C57.219940,41.729317 56.275139,42.135178 55.626091,49.132107 C55.181522,53.924690 
                    55.384293,58.775002 55.227200,63.597210 C55.065445,68.562500 53.231388,69.811966 
                    49.011013,67.538071 C43.740887,64.698570 38.528667,61.722706 33.474686,58.516842 
                    C22.344749,51.456841 19.030855,34.018814 34.516224,26.126232 C42.214909,22.202366 
                    49.594357,17.652161 57.485565,13.231802 

                    M59.587967,39.881359 C72.812675,47.319241 86.037384,54.757122 99.941704,62.577229 
                    C99.941704,55.262440 99.940659,48.839806 99.942024,42.417171 C99.943222,36.766106 
                    97.475334,32.572613 92.571220,29.761070 C85.228561,25.551510 77.916039,21.289412 
                    70.576057,17.075171 C66.404892,14.680308 62.040924,14.153979 57.766373,16.576694 
                    C50.708965,20.576666 43.770916,24.787231 36.092228,28.984127 C26.304821,33.681614 
                    23.312248,44.170467 30.878633,51.835636 C36.608875,57.640697 44.355145,61.455715 
                    51.937500,66.659561 C52.284210,58.976528 52.399632,52.997326 52.879776,47.047550 
                    C53.173111,43.412640 54.395123,40.124947 59.587967,39.881359 z'
            />
            <path fill={border} d='M78.264473,111.211761 C68.340340,118.711182 58.861603,118.447044 
                    49.016762,111.556145 C43.452381,107.661339 37.278091,104.647484 31.464331,101.096352 
                    C26.703596,98.188431 24.278111,93.671745 24.087042,88.221039 C23.848320,81.410965 
                    23.931273,74.581970 24.114210,67.767555 C24.227818,63.535686 26.824183,62.527809 
                    31.102869,64.988503 C41.909904,71.203697 52.677254,77.488045 63.448429,83.765396 
                    C69.678551,87.396255 71.054581,86.808716 71.601692,79.672104 C71.957001,75.037514 
                    71.773560,70.363251 71.888092,65.708153 C72.016037,60.507572 73.926926,59.259628 
                    78.342499,61.687485 C83.437904,64.489120 88.522888,67.337517 93.419746,70.467049 
                    C106.252579,78.668373 106.732712,96.411400 92.411140,103.077812 C87.609093,105.313057 
                    83.186424,108.363319 78.264473,111.211761 

                    M67.407295,89.286354 C54.180603,81.816048 40.953915,74.345741 27.165855,66.558380 
                    C27.165855,74.169807 27.082527,80.826813 27.193050,87.480606 C27.276745,92.519234 
                    29.562822,96.455002 33.930202,99.009354 C41.546898,103.464127 49.201843,107.854355 
                    56.874142,112.212860 C61.292747,114.723007 65.810760,114.675102 70.197296,112.163147 
                    C76.981789,108.278015 83.701920,104.280479 91.116325,100.185280 C101.479301,94.975677 
                    103.684219,83.362946 94.961784,75.723915 C89.224304,70.699074 82.134460,67.218391 
                    75.257561,62.793587 C74.860985,70.143944 74.666405,76.441757 74.126305,82.709801 
                    C73.822548,86.234871 72.310989,89.142479 67.407295,89.286354 z'
            />
        </svg>
    );
};

const LogoText = (props: LogoTextProps) => {
    const { text } = props;

    const { size = '24px', color } = text;

    return (
        <Typography
            variant='h3'
            sx={{
                fontSize: size,
                fontWeight: 200,
                letterSpacing: '-0.8px',
                color: (theme) => color || theme.palette.text.primary,
                userSelect: 'none'
            }}
        >
            {text.content}
        </Typography>
    );
};


import { createElement } from 'react';
// importing types
import type { LordIconProps } from '../types';

export const LordIcon = (props: LordIconProps) => {
    const { src, size, trigger, primary, secondary, delay, stroke } = props;

    const colors = `primary:${primary},secondary:${secondary}`;
    const style = { height: size, width: size };

    return createElement('lord-icon', {
        src,
        trigger,
        stroke,
        delay,
        colors,
        style,
    });
};


import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
// importing icons
import CloseIcon from '@mui/icons-material/Close';
// importing types
import type { Breakpoint, SvgIconProps } from '@mui/material';
import type { ModalProps } from '../types';
// importing contexts
import { useModalContext } from '../contexts/modal.context';
// importing components
import { CenteredBox } from './CenteredBox';

// NOTE: DO NOT pass states from component to modal.body component; No re-render will happen for any state change
// Atmost what we can do is make use of context to share data between component and modal.body component
const Modal = (props: ModalProps) => {
    const { modalData, onClose } = props;
    const { id, isPersistent, maxWidth, bgcolor = 'background.paper', unstyled, modalButtons, hideTitle, modalContent } = modalData;
    const { body } = modalContent;

    const title = 'title' in modalContent ? modalContent.title : '';
    const px = unstyled ? 0 : 2;
    const py = unstyled ? 0 : 1.5;

    let top;
    let right;
    if (hideTitle) {
        const { closeButton } = modalData;
        top = closeButton?.top || '32px';
        right = closeButton?.right || '32px';
    }

    const [loading, setLoading] = useState(false);

    // TODO: Add optional onClose guard - Confirm before closing (unsaved changes etc.)
    // To implement above we would need a gaurdString which if present then open another modal with 'OK' and 'CANCEL' button 
    const handleClose = async (onClickFunction?: () => Promise<boolean> | boolean) => {
        if (onClickFunction) {
            setLoading(true);
            const success = await onClickFunction();
            setLoading(false);

            if (success) {
                return onClose(id);
            }
        } else {
            onClose(id);
        }
    };

    const CloseButton = (props: SvgIconProps) => {
        const { sx, ...rest } = props;

        return (
            <CloseIcon
                onClick={() => handleClose()}
                fontSize={hideTitle ? 'large' : 'small'}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal || 130,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'text.primary' },
                    ...sx
                }}
                {...rest}
            />
        );
    };

    return (
        <Dialog
            open={true}
            onClose={() => { !isPersistent && handleClose() }}
            maxWidth={maxWidth === undefined ? false : maxWidth as Breakpoint}
        >
            <Box sx={{ bgcolor }}>
                {!hideTitle &&
                    <>
                        <CenteredBox sx={{ gap: 4, justifyContent: 'space-between', px, py }}>
                            <>{title}</>

                            {!isPersistent && <CloseButton />}
                        </CenteredBox>

                        {loading ?
                            <LinearProgress />
                            : <Divider sx={{ height: '2px' }} />
                        }
                    </>
                }

                <Box sx={{ position: 'relative', px, py }}>
                    {(!isPersistent && hideTitle) &&
                        <CloseButton sx={{ position: 'absolute', top, right }} />
                    }
                    {body}
                </Box>

                <CenteredBox sx={{ gap: 1, float: 'right', px, py }}>
                    {modalButtons?.map((button, index) => {
                        const { label, onClickFunction, autoFocus = false, ...rest } = button;

                        return (
                            <Button
                                key={index}
                                autoFocus={autoFocus}
                                onClick={() => handleClose(onClickFunction)}
                                disabled={loading}
                                {...rest}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </CenteredBox>
            </Box>
        </Dialog>
    );
};

export const Modals = () => {
    const { modals, closeModal } = useModalContext();

    return modals?.map((modal) => (
        <Modal
            key={modal.id}
            modalData={modal}
            onClose={closeModal}
        />
    ));
};


import Box from '@mui/material/Box';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { PageBaseProps } from '../types';

export const PageBase = (props: PageBaseProps) => {
    const { sx, children, ...rest } = props;

    const { navbarHeightPx } = clientConfig;

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            pt: `${navbarHeightPx}px`,
            color: 'text.primary',
            bgcolor: 'background.default',
            ...sx,
        }} {...rest}>
            {children}
        </Box>
    );
};


import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { SyntheticEvent } from 'react';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import type { SnackBarProps } from '../types';
// importing contexts
import { useSnackBarContext } from '../contexts/snackbar.context';
// importing hooks
import { useMobile } from '../hooks/useMobile';

const SnackBar = (props: SnackBarProps) => {
    const { snackBarData, onClose } = props;
    const { id, status, message } = snackBarData;

    const { transitionDurationMs, snackbarTimeOutMs } = clientConfig;

    const isMobile = useMobile();

    const handleClose = (_event: SyntheticEvent | Event, reason: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        onClose(id);
    };

    return (
        <Snackbar
            open={true}
            autoHideDuration={snackbarTimeOutMs}
            transitionDuration={transitionDurationMs}
            anchorOrigin={{
                vertical: isMobile ? 'top' : 'bottom',
                horizontal: 'right',
            }}
            onClose={handleClose}
            sx={{ position: 'static', pointerEvents: 'auto', }}
        >
            <Alert
                variant='filled'
                severity={status}
                onClose={handleClose as any}
                sx={{ color: 'white', width: isMobile ? '100%' : 'fit-content' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export const SnackBars = () => {
    const { snackBars, closeSnackBar } = useSnackBarContext();

    return (
        <Box sx={{
            display: 'flex',
            flexFlow: 'column-reverse',
            gap: 0.5,
            position: 'fixed',
            inset: 0,
            overflow: 'hidden',
            p: 1,
            pointerEvents: 'none',
            zIndex: (theme) => theme.zIndex.snackbar || 140,
        }}>
            {snackBars?.map((snackBar) => (
                <SnackBar
                    key={snackBar.id}
                    snackBarData={snackBar}
                    onClose={closeSnackBar}
                />
            ))}
        </Box>
    );
};


import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { ToolTipProps } from '../types';

export const ToolTip = (props: ToolTipProps) => {
    const { title, children, placement = 'bottom', duration } = props;

    const { transitionDurationMs } = clientConfig;

    return (
        <Tooltip
            title={title}
            placement={placement}
            slots={{ transition: Fade }}
            slotProps={{
                transition: { timeout: duration ?? transitionDurationMs },
            }}
        >
            {children}
        </Tooltip>
    );
};


import { createContext, useContext, useState } from 'react';
import { isArray, validate } from '@syncspace/shared'
// importing types;
import type {
    ContextProviderProps,
    ModalContextType,
    ModalState,
    ModalType,
    ModalUpdate,
} from '../types';

// FIXME: Modals take way too long to open
const ModalContext = createContext<ModalContextType>({
    modals: [] as ModalState[],
    openModal: (_data: ModalState) => { },
    editModal: (_data: any) => { },
    replaceModal: (_data: ModalState) => { },
    closeModal: (_id: ModalType) => { },
});
export const useModalContext = () => useContext(ModalContext);

export const ModalProvider = (props: ContextProviderProps) => {
    const { children } = props;

    const [modals, setModals] = useState<ModalState[]>([]);

    const openModal = (data: ModalState) => {
        setModals((prevModals) => {
            if (!prevModals) {
                prevModals = [];
            }

            return [...prevModals, data];
        });
    };

    const editModal = (data: ModalUpdate) => {
        const { id } = data;
        setModals((prevModals) => {
            return prevModals?.map((modal) => {
                if (modal.id === id) {
                    return { ...modal, ...data } as ModalState;
                } else {
                    return modal;
                }
            });
        });
    };

    const replaceModal = (data: ModalState) => {
        const { id } = data;
        setModals((prevModals) => {
            return prevModals?.map((modal) => {
                if (modal.id === id) {
                    return data;
                } else {
                    return modal;
                }
            });
        });
    };

    const closeModal = async (id: ModalType) => {
        setModals((prevModals) => {
            if (!validate(prevModals, isArray, 'closeModal.prevModals')) {
                return [];
            }
            if (prevModals.length === 0) {
                return [];
            }

            return prevModals?.filter((modal) => modal.id !== id)
        });
    };

    return (
        <ModalContext.Provider
            value={{
                modals,
                openModal,
                editModal,
                replaceModal,
                closeModal,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};


import { createContext, useContext, useState } from 'react';
// importing types
import type { AlertState, ContextProviderProps, SnackBarContextType, SnackBarState } from '../types';

const SnackBarContext = createContext<SnackBarContextType>({
    snackBars: [] as SnackBarState[],
    openSnackBar: (_data: AlertState) => { },
    closeSnackBar: (_id: number) => { },
});
export const useSnackBarContext = () => useContext(SnackBarContext);

export const SnackBarProvider = (props: ContextProviderProps) => {
    const { children } = props;

    const [snackBars, setSnackBars] = useState<SnackBarState[]>([]);

    const openSnackBar = (data: AlertState) => {
        const newSnackBar = { ...data, id: Date.now() };
        setSnackBars((prevSnackBars) => [...prevSnackBars, newSnackBar]);
    };

    const closeSnackBar = (id: number) => {
        setSnackBars((prevSnackBars) =>
            prevSnackBars.filter((snackBar) => snackBar.id !== id)
        );
    };

    return (
        <SnackBarContext.Provider
            value={{
                snackBars,
                openSnackBar,
                closeSnackBar,
            }}
        >
            {children}
        </SnackBarContext.Provider>
    );
};


import { createContext, useMemo, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { defaultStartupSetting } from '@syncspace/shared';
// importing types
import type { ContextProviderProps, RootState, ThemeContextType } from '../types';
import type { Theme as MuiTheme, PaletteOptions } from '@mui/material';
import type { Theme } from '@syncspace/shared';

const ThemeContext = createContext<ThemeContextType>({
    theme: defaultStartupSetting.theme,
    palette: {} as Record<Theme, PaletteOptions>,
    designTokens: {} as MuiTheme,
});
export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = (props: ContextProviderProps) => {
    const { children } = props;

    const setting = useSelector((state: RootState) => state.user.user.setting);
    const theme = setting.startupSetting.theme;

    const themeOptions = useMemo(() => ({
        theme,
        palette,
        designTokens: getDesignTokens(theme),
    }), [theme]);

    const providerTheme = useMemo(() => {
        return createTheme(getDesignTokens(theme));
    }, [theme]);

    useEffect(() => {
        const meta = document.querySelector(`meta[name='color-scheme']`);
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={themeOptions}>
            <MuiThemeProvider theme={providerTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

const BaseTheme = {
    common: {
        black: '#000000',
        white: '#ffffff',
    },
    error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#ffffff',
    },
    warning: {
        main: '#ffa726',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#ffffff',
    },
    success: {
        main: '#66bb6a',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
    },
    info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
        contrastText: '#ffffff',
    },
    grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
        A100: '#f5f5f5',
        A200: '#eeeeee',
        A400: '#bdbdbd',
        A700: '#616161',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
};

const palette = {
    'light': {
        mode: 'light',
        primary: {
            main: '#673ab7',
            light: '#8561c5',
            dark: '#482880',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#d500f9',
            light: '#dd33fa',
            dark: '#9500ae',
            contrastText: '#ffffff',
        },
        divider: '#424242',
        text: {
            primary: '#000000',
            secondary: '#474646',
            disabled: '#898989',
        },
        background: {
            paper: '#fafafa',
            default: '#eeeeee',
        },
    },
    'dark': {
        mode: 'dark',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00b0ff',
            light: '#33bfff',
            dark: '#007bb2',
            contrastText: '#ffffff',
        },
        divider: '#2f2f2f',
        text: {
            primary: '#ffffff',
            secondary: '#b8b8b8',
            disabled: '#898989',
        },
        background: {
            paper: '#121212',
            default: '#000000',
        },
    },
    'retro': {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00b0ff',
            light: '#33bfff',
            dark: '#007bb2',
            contrastText: '#ffffff',
        },
        divider: '#424242',
        text: {
            primary: '#000000',
            secondary: '#474646',
            disabled: '#0090c1',
        },
        background: {
            paper: '#fafafa',
            default: '#eeeeee',
        },
    },
} as Record<Theme, PaletteOptions>;

const getDesignTokens = (theme: Theme): MuiTheme => createTheme({
    palette: {
        ...(palette[theme] as PaletteOptions),
        ...(BaseTheme as PaletteOptions),
    },
    typography: {
        caption: {
            letterSpacing: '-0.1px',
        }
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-input': {
                        fontWeight: 300,
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontWeight: 350,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 350,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: '2px !important',
                },
                bar1Indeterminate: {
                    animationDuration: '1s',
                },
                bar2Indeterminate: {
                    animationDuration: '1s',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    paddingTop: '8px',
                    paddingBottom: '8px',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontWeight: 350,
                },
            },
        },
    },
    zIndex: {
        mobileStepper: 100,
        fab: 105,
        speedDial: 105,
        appBar: 110,
        drawer: 120,
        modal: 130,
        snackbar: 140,
        tooltip: 150,
    },
});


export const clientConfig = {
    websiteName: 'SyncSpace',
    localStorageKey: 'syncspace-settings',
    transitionDurationMs: 600,
    mobileBreakpointPx: 768,
    snackbarTimeOutMs: 3000,

    debounce: {
        textField: 600,
        chipSelection: 400,
    },

    navbarHeightPx: 64,
    settingsSidebarWidthPx: 240,

    authPathRegex: /^\/auth\/(login|register)$/,
};


import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
// importing icons
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
// importing types
import type { AuthCaptionProps, AuthFooterProps, AuthProvidersProps, StyledAuthProviderButtonProps } from '../../types';
// importing hooks
import { useGoogle } from '../../hooks/useGoogle';
import { useFacebook } from '../../hooks/useFacebook';
// importing components
import { CenteredBox } from '../../../../components/CenteredBox';

export const AuthFooter = (props: AuthFooterProps) => {
    const { authMode, toggleAuthModal } = props;

    const { signUpWithGoogle } = useGoogle();
    const { signUpWithFacebook } = useFacebook();

    return (
        <>
            <AuthCaption
                authMode={authMode}
                toggleAuthModal={toggleAuthModal}
            />

            <CenteredBox sx={{ width: '100%', mt: 0.5, mb: 1.5 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant='body2' color='text.secondary' sx={{ px: 2 }}>
                    OR
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
            </CenteredBox>

            <AuthProviders
                signUpWithGoogle={signUpWithGoogle}
                signUpWithFacebook={signUpWithFacebook}
            />
        </>
    );
};

const AuthCaption = (props: AuthCaptionProps) => {
    const { authMode, toggleAuthModal } = props;

    return (
        <Typography component='span' variant='caption' color='text.secondary' sx={{ mt: 0.75 }}>
            {authMode === 'login' && `Don't`}
            {authMode === 'register' && 'Already'}
            {' '}have an account?{' '}

            <Typography
                component='span'
                variant='caption'
                color='primary'
                sx={{
                    cursor: 'pointer',
                    fontWeight: 'medium',
                    '&:hover': { color: 'primary.dark' },
                }}
                onClick={toggleAuthModal}
            >
                {authMode === 'login' && 'Create Account'}
                {authMode === 'register' && 'Log in'}
            </Typography>
        </Typography>
    );
};

const AuthProviders = (props: AuthProvidersProps) => {
    const { signUpWithGoogle, signUpWithFacebook } = props;

    return (
        <CenteredBox sx={{ flexDirection: 'column', gap: 1, width: '100%' }}>
            <StyledAuthProviderButton
                provider='Google'
                icon={<GoogleIcon fontSize='small' />}
                onClick={signUpWithGoogle}
                sx={{ bgcolor: '#DB4437' }}
            />

            <StyledAuthProviderButton
                provider='Facebook'
                icon={<FacebookIcon fontSize='small' />}
                onClick={signUpWithFacebook}
                sx={{ bgcolor: '#3b5998' }}
            />
        </CenteredBox>
    );
};

const StyledAuthProviderButton = (props: StyledAuthProviderButtonProps) => {
    const { provider, icon, sx, ...rest } = props;

    return (
        <Button
            variant='contained'
            sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'white', ...sx }}
            fullWidth
            {...rest}
        >
            {icon}
            <span>Continue with {provider}</span>
        </Button>
    );
};


import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// impoting types
import type { AuthHeaderProps } from '../../types';
// importing contexts
import { useThemeContext } from '../../../../contexts/theme.context';
// impoting components
import { CenteredBox } from '../../../../components/CenteredBox';
import { LordIcon } from '../../../../components/LordIcon';

export const AuthHeader = (props: AuthHeaderProps) => {
    const { lordIcon, heading, subHeading } = props;

    const { designTokens } = useThemeContext();

    const {
        src = 'https://cdn.lordicon.com/lltgvngb.json',
        trigger = 'hover',
        stroke = 'bold',
        delay,
        primary = designTokens?.palette?.primary?.contrastText,
        secondary = designTokens?.palette?.primary?.contrastText,
        size = '36px',
    } = lordIcon;

    return (
        <Box sx={{ textAlign: 'center' }}>
            <CenteredBox
                sx={{
                    display: 'inline-flex',
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    mb: 1.25,
                    borderRadius: '50%',
                }}
            >
                <LordIcon
                    src={src}
                    trigger={trigger}
                    stroke={stroke}
                    delay={delay}
                    primary={primary}
                    secondary={secondary}
                    size={size}
                />
            </CenteredBox>
            <Typography component='h3' variant='h5'>
                {heading}
            </Typography>
            <Typography component='span' variant='caption' color='text.secondary'>
                {subHeading}
            </Typography>
        </Box>
    );
}


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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// importing types
import type { AuthModalProps, AuthMode } from '../types';
// importing components
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
// importing assets
import authBgImg from '/assets/img-bg-register-6.png';

export const AuthModal = (props: AuthModalProps) => {
    const { authMode: propsAuthMode, fullPage } = props;

    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>(propsAuthMode);

    const toggleAuthModal = () => {
        const newAuthMode = authMode === 'login' ? 'register' : 'login';

        if (fullPage) {
            return navigate(`/auth/${newAuthMode}`);
        }

        setAuthMode(newAuthMode);
    };

    const width = authMode === 'login' ? '30vw' : '75vw';
    const maxWidth = authMode === 'login' ? '560px' : '1080px';

    return (
        <Box sx={{
            display: 'flex',
            maxHeight: '90vh',
            width,
            maxWidth,
            color: 'text.primary',
            bgcolor: fullPage ? 'background.default' : 'background.paper',
            p: 6,
        }}>
            {authMode === 'register' &&
                <Box sx={{ display: 'flex', gap: 8, alignSelf: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1, background: `center / contain no-repeat url(${authBgImg})` }}>
                        <Typography
                            variant='h3'
                            component='h2'
                            sx={{ fontWeight: 'bold', textShadow: '1px 1px 4px rgba(0, 0, 255, 0.65)' }}
                        >
                            Explore interests.
                            <br />
                            Share ideas.
                            <br />
                            Be heard.
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <RegisterForm toggleAuthModal={toggleAuthModal} />
                    </Box>
                </Box>
            }

            {authMode === 'login' && <LoginForm toggleAuthModal={toggleAuthModal} />}
        </Box>
    );
};


import { validateEmail } from '@syncspace/shared';
import Button from '@mui/material/Button';
// importing hooks
import { useAuthModal } from '../hooks/useAuthModal';
import { useForgotPassword } from '../hooks/useForgotPassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { GenericAuthModal } from '../../../components/GenericAuthModal';

export const ForgotPasswordModal = () => {
    const {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
        forgotPasswordStatus,
    } = useForgotPassword();
    const { closeForgotPasswordModal } = useAuthModal();

    const { email } = formData;

    const forgotPasswordSucceeded = forgotPasswordStatus === 'succeeded';

    return (
        <GenericAuthModal
            heading={forgotPasswordSucceeded ? 'Reset mail send' : 'Forgot Password?'}
            subHeading={forgotPasswordSucceeded ?
                `If this email is registered with us, you'll receive a password reset link shortly.` :
                'Enter your registered email on which you want to recieve reset mail'
            }
            lordicon={{
                src: forgotPasswordSucceeded ?
                    'https://cdn.lordicon.com/fsstjlds.json' :
                    'https://cdn.lordicon.com/dicvhxpz.json',
            }}
        >
            {forgotPasswordSucceeded ?
                <Button fullWidth variant='outlined' onClick={closeForgotPasswordModal}>
                    Close modal
                </Button> :
                <CenteredBox
                    component='form'
                    sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                    onSubmit={handleSubmit}
                >
                    <FormTextField
                        name='email'
                        label='Email'
                        type={'text'}
                        data={email}
                        submitting={forgotPasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={emailRef}
                        dispatch={formDispatch}
                        validate={validateEmail}
                        required
                    />

                    <CenteredBox sx={{ gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                        <Button variant='outlined' onClick={closeForgotPasswordModal}>Cancel</Button>
                        <Button type='submit' variant='contained'>Ok</Button>
                    </CenteredBox>
                </CenteredBox>
            }
        </GenericAuthModal>
    );
};


import { validateEmail } from '@syncspace/shared';
import Button from '@mui/material/Button';
// importing hooks
import { useAuthModal } from '../hooks/useAuthModal';
import { useForgotPassword } from '../hooks/useForgotPassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { GenericAuthModal } from '../../../components/GenericAuthModal';

export const ForgotPasswordModal = () => {
    const {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
        forgotPasswordStatus,
    } = useForgotPassword();
    const { closeForgotPasswordModal } = useAuthModal();

    const { email } = formData;

    const forgotPasswordSucceeded = forgotPasswordStatus === 'succeeded';

    return (
        <GenericAuthModal
            heading={forgotPasswordSucceeded ? 'Reset mail send' : 'Forgot Password?'}
            subHeading={forgotPasswordSucceeded ?
                `If this email is registered with us, you'll receive a password reset link shortly.` :
                'Enter your registered email on which you want to recieve reset mail'
            }
            lordicon={{
                src: forgotPasswordSucceeded ?
                    'https://cdn.lordicon.com/fsstjlds.json' :
                    'https://cdn.lordicon.com/dicvhxpz.json',
            }}
        >
            {forgotPasswordSucceeded ?
                <Button fullWidth variant='outlined' onClick={closeForgotPasswordModal}>
                    Close modal
                </Button> :
                <CenteredBox
                    component='form'
                    sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                    onSubmit={handleSubmit}
                >
                    <FormTextField
                        name='email'
                        label='Email'
                        type={'text'}
                        data={email}
                        submitting={forgotPasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={emailRef}
                        dispatch={formDispatch}
                        validate={validateEmail}
                        required
                    />

                    <CenteredBox sx={{ gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                        <Button variant='outlined' onClick={closeForgotPasswordModal}>Cancel</Button>
                        <Button type='submit' variant='contained'>Ok</Button>
                    </CenteredBox>
                </CenteredBox>
            }
        </GenericAuthModal>
    );
};


import { useSelector } from 'react-redux';
import { validateEmail, validatePassword } from '@syncspace/shared';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// importing icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing types
import type { RootState } from '../../../types';
import type { LoginFormProps } from '../types';
// impoting hooks
import { useAuthModal } from '../hooks/useAuthModal';
import { useLoginForm } from '../hooks/useLogin';
// impoting components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { AuthFooter } from './ui/AuthFooter';
import { AuthHeader } from './ui/AuthHeader';
import { SubmitButton } from './ui/SubmitButton';

export const LoginForm = (props: LoginFormProps) => {
    const { toggleAuthModal } = props;

    const loginStatus = useSelector((state: RootState) => state.user.status.login);

    const {
        formData,
        formDispatch,
        onChange,
        refs,
        showPassword,
        setShowPassword,
        handleLogin,
    } = useLoginForm();

    const { openForgotPasswordModal } = useAuthModal();

    const { email, password } = formData;
    const { emailRef, passwordRef } = refs;

    return (
        <CenteredBox sx={{ flexDirection: 'column', gap: 2, alignSelf: 'center', width: '100%' }}>
            <AuthHeader
                lordIcon={{ src: 'https://cdn.lordicon.com/urswgamh.json' }}
                heading='Welcome Back'
                subHeading='Sign in to your account to continue'
            />

            <CenteredBox
                component='form'
                sx={{ flexDirection: 'column', width: '100%' }}
                onSubmit={handleLogin}
            >
                <CenteredBox sx={{ flexDirection: 'column', gap: 2.75, width: '100%' }}>
                    <FormTextField
                        name='email'
                        label='Email'
                        data={email}
                        submitting={loginStatus === 'loading'}
                        onChange={onChange}
                        inputRef={emailRef}
                        dispatch={formDispatch}
                        validate={validateEmail}
                        required
                    />

                    <FormTextField
                        name='password'
                        label='Password'
                        type={showPassword ? 'text' : 'password'}
                        data={password}
                        submitting={loginStatus === 'loading'}
                        onChange={onChange}
                        inputRef={passwordRef}
                        dispatch={formDispatch}
                        validate={validatePassword}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment
                                        position='end'
                                        onClick={() => setShowPassword(!showPassword)}
                                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </CenteredBox>

                <SubmitButton
                    label='Log In'
                    submitting={loginStatus === 'loading'}
                />

                <AuthFooter authMode='login' toggleAuthModal={toggleAuthModal} />

                <Typography
                    component='span'
                    variant='caption'
                    color='primary'
                    onClick={openForgotPasswordModal}
                    sx={{
                        mt: 2,
                        cursor: 'pointer',
                        fontWeight: 'medium',
                        '&:hover': { color: 'primary.dark' },
                    }}
                >
                    Forgot Password?
                </Typography>
            </CenteredBox>
        </CenteredBox>
    );
};


import { useEffect } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { validatePassword } from '@syncspace/shared';
// importing icons
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
import InvalidIcon from '@mui/icons-material/Close';
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import ValidIcon from '@mui/icons-material/Check';
// importing types
import type { RegisterCredentialsFormProps } from '../types';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';
// importing components
import { FormTextField } from '../../../components/FormTextField';

export const RegisterCredentialsForm = (props: RegisterCredentialsFormProps) => {
    const {
        email,
        password,
        emailRef,
        passwordRef,
        formDispatch,
        onChange,
        showPassword,
        setShowPassword,
        emailAvailability,
        validateEmailAvailability,
        submitting,
    } = props;

    const isMobile = useMobile();

    useEffect(() => {
        if (!isMobile) {
            emailRef.current?.focus();
        }
    }, [isMobile]);

    return (
        <>
            <FormTextField
                name='email'
                label='Email'
                data={email}
                submitting={submitting}
                onChange={onChange}
                inputRef={emailRef}
                dispatch={formDispatch}
                validate={validateEmailAvailability}
                required
                slotProps={{
                    input: {
                        endAdornment: (
                            emailAvailability !== undefined &&
                            <InputAdornment
                                position='end'
                                sx={{ color: emailAvailability ? 'success.main' : 'error.main' }}
                            >
                                {emailAvailability ? <ValidIcon fontSize='small' /> : <InvalidIcon fontSize='small' />}
                            </InputAdornment>
                        ),
                    },
                }}
            />

            <FormTextField
                name='password'
                label='Password'
                type={showPassword ? 'text' : 'password'}
                data={password}
                submitting={submitting}
                onChange={onChange}
                inputRef={passwordRef}
                dispatch={formDispatch}
                validate={validatePassword}
                required
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment
                                position='end'
                                onClick={() => setShowPassword(!showPassword)}
                                sx={{ color: 'text.disabled', cursor: 'pointer' }}
                            >
                                {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </>
    );
};


import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
// impoting icons
import BackIcon from '@mui/icons-material/ArrowBack';
// impoting types
import type { RootState } from '../../../types';
import type { RegisterFormProps } from '../types';
// impoting hooks
import { useRegisterForm } from '../hooks/useRegister';
// impoting components
import { CenteredBox } from '../../../components/CenteredBox';
import { AuthFooter } from './ui/AuthFooter';
import { AuthHeader } from './ui/AuthHeader';
import { RegisterCredentialsForm } from './RegisterCredentialsForm';
import { RegisterProfileForm } from './RegisterProfileForm';
import { SubmitButton } from './ui/SubmitButton';

export const RegisterForm = (props: RegisterFormProps) => {
    const { toggleAuthModal } = props;

    const registerStatus = useSelector((state: RootState) => state.user.status.register);

    const {
        formData,
        formDispatch,
        onChange,
        fileData,
        fileDispatch,
        refs,
        showPassword,
        setShowPassword,
        emailAvailability,
        validateEmailAvailability,
        usernameAvailability,
        validateUsernameAvailability,
        handleRegister,
        phase,
        naviagteToCredentialsPhase,
    } = useRegisterForm();

    const { email, password, username } = formData;
    const { emailRef, passwordRef, usernameRef } = refs;
    const { profilePic } = fileData;

    const steps = ['Account Details', 'Profile Setup'];
    const activeStep = phase === 'CREDENTIALS' ? 0 : 1;

    return (
        <CenteredBox sx={{ flexDirection: 'column', gap: 2, width: '100%' }}>
            <AuthHeader
                lordIcon={{ src: 'https://cdn.lordicon.com/kdduutaw.json', size: '30px' }}
                heading='Create Account'
                subHeading={phase === 'CREDENTIALS'
                    ? 'Enter your credentials to get started'
                    : 'Complete your profile to finish registration'}
            />

            <Stepper
                activeStep={activeStep}
                alternativeLabel sx={{
                    width: '100%',
                    '.MuiStepLabel-iconContainer svg': { fontSize: 16, mt: 0.55 },
                    '.MuiStepLabel-labelContainer span': { fontSize: 12, mt: 0.95 },
                }}>
                {steps.map((label) => (
                    <Step key={label} sx={{ fontSize: 12 }}>
                        <StepLabel>
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <CenteredBox
                component='form'
                sx={{ flexDirection: 'column', width: '100%' }}
                onSubmit={handleRegister}
            >
                <CenteredBox sx={{ flexDirection: 'column', gap: 2.75, width: '100%' }}>
                    {phase === 'CREDENTIALS' &&
                        <RegisterCredentialsForm
                            email={email}
                            password={password}
                            emailRef={emailRef}
                            passwordRef={passwordRef}
                            formDispatch={formDispatch}
                            onChange={onChange}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            emailAvailability={emailAvailability}
                            validateEmailAvailability={validateEmailAvailability}
                            submitting={registerStatus === 'loading'}
                        />
                    }
                    {phase === 'PROFILE' &&
                        <RegisterProfileForm
                            username={username}
                            profilePic={profilePic}
                            usernameRef={usernameRef}
                            onChange={onChange}
                            formDispatch={formDispatch}
                            fileDispatch={fileDispatch}
                            usernameAvailability={usernameAvailability}
                            validateUsernameAvailability={validateUsernameAvailability}
                            submitting={registerStatus === 'loading'}
                        />
                    }
                </CenteredBox>

                <SubmitButton
                    label={phase === 'CREDENTIALS' ? 'Continue' : 'Register'}
                    submitting={registerStatus === 'loading'}
                />

                {phase === 'CREDENTIALS' && <AuthFooter authMode='register' toggleAuthModal={toggleAuthModal} />}

                {phase === 'PROFILE' &&
                    <Button
                        variant='text'
                        onClick={naviagteToCredentialsPhase}
                        startIcon={<BackIcon />}
                        disabled={registerStatus === 'loading'}
                        fullWidth
                        sx={{
                            mt: 1,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
                        }}
                    >
                        Back to credentials
                    </Button>
                }
            </CenteredBox>
        </CenteredBox>
    );
};


import { useEffect } from 'react';
import { validateProfilePic } from '@syncspace/shared';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
// importing icons
import ValidIcon from '@mui/icons-material/Check';
import InvalidIcon from '@mui/icons-material/Close';
// importing types 
import type { RegisterProfileFormProps } from '../types';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FileUploader } from '../../../components/FileUploader';
import { FormTextField } from '../../../components/FormTextField';

export const RegisterProfileForm = (props: RegisterProfileFormProps) => {
    const {
        username,
        profilePic,
        usernameRef,
        onChange,
        formDispatch,
        fileDispatch,
        usernameAvailability,
        validateUsernameAvailability,
        submitting,
    } = props;

    const isMobile = useMobile();

    useEffect(() => {
        if (!isMobile) {
            usernameRef.current?.focus();
        }
    }, [isMobile]);

    return (
        <>
            <CenteredBox sx={{ flexDirection: 'column', width: '100%' }}>
                <Typography variant='body1'>
                    Profile Picture
                </Typography>

                <FileUploader
                    name='profilePic'
                    data={profilePic}
                    submitting={submitting}
                    dispatch={fileDispatch}
                    validate={validateProfilePic}
                    accept='image/*'
                    uploadIcon={<Avatar sx={{ height: 96, width: 96 }} />}
                    size={100}
                    sx={{
                        border: '3px solid',
                        borderColor: 'primary.main',
                        borderRadius: '50%',
                        '&:hover': {
                            borderColor: 'primary.dark',
                            '& .upload-overlay': { opacity: 1 },
                        },
                    }}
                />
            </CenteredBox>

            {/* TODO: Add text regarding 'username cannot be changed later' */}
            <FormTextField
                name='username'
                label='Username'
                data={username}
                onChange={onChange}
                submitting={submitting}
                inputRef={usernameRef}
                dispatch={formDispatch}
                validate={validateUsernameAvailability}
                required
                slotProps={{
                    input: {
                        endAdornment: (
                            usernameAvailability !== undefined &&
                            <InputAdornment
                                position='end'
                                sx={{ color: usernameAvailability ? 'success.main' : 'error.main' }}
                            >
                                {usernameAvailability ? <ValidIcon fontSize='small' /> : <InvalidIcon fontSize='small' />}
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </>
    );
};


// importing types
import type { AuthMode } from '../types';
// importing contexts
import { useModalContext } from '../../../contexts/modal.context';
// importing components
import { AuthModal } from '../components/AuthModal';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

export const useAuthModal = () => {
    const { openModal, closeModal } = useModalContext();

    const openAuthModal = (authMode: AuthMode) => {
        openModal({
            id: 'auth',
            hideTitle: true,
            modalContent: {
                body: <AuthModal authMode={authMode} />
            },
            unstyled: true,
        });
    };

    const closeAuthModal = () => {
        closeModal('auth');
    };

    const openForgotPasswordModal = () => {
        openModal({
            id: 'forgotPassword',
            isPersistent: true,
            hideTitle: true,
            modalContent: {
                body: <ForgotPasswordModal />
            },
            unstyled: true,
        });
    };

    const closeForgotPasswordModal = () => {
        closeModal('forgotPassword');
    };

    return {
        openAuthModal,
        closeAuthModal,
        openForgotPasswordModal,
        closeForgotPasswordModal,
    };
};


import { logMessage } from '../../../utils/log.util';

export const useFacebook = () => {
    const signUpWithFacebook = async () => {
        logMessage('Sign up with Facebook')
    };

    return {
        signUpWithFacebook,
    };
};


import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ApiError, ApiResponse, validateAll, validatePassword } from '@syncspace/shared';
// importing types
import type { FormEvent } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { ApiCallStatus, FormState } from '../../../types';
import type { ForgotPasswordField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useMobile } from '../../../hooks/useMobile';
// importing services
import {
    forgotPassword as forgotPasswordService,
} from '../services/api.service';

export const useForgotPassword = () => {
    const showErrorSnackBar = useErrorSnackBar();
    const isMobile = useMobile();

    const [forgotPasswordStatus, setForgotPasswordStatus] = useState<ApiCallStatus>('idle');

    const initialFormState: FormState<ForgotPasswordField> = createInitialFormState(['email']);
    const [formData, formDispatch] = useReducer(formReducer<ForgotPasswordField>, initialFormState);
    const { email } = formData;
    const onChange = useMemo(() => handleFormDataChange<ForgotPasswordField>(formDispatch), []);

    const emailRef = useRef<HTMLInputElement | null>(null);

    const forgotPasswordErrorHandler = createErrorHandler<ForgotPasswordField>(formDispatch, [emailRef]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (forgotPasswordStatus === 'loading') {
                return;
            }

            setForgotPasswordStatus('loading');

            const emailValidity = validateAll(validatePassword(email.value));
            if (emailValidity !== true) {
                throw emailValidity;
            }

            const response = await forgotPasswordService({ email: email.value });
            showErrorSnackBar(response);
            if (response instanceof ApiError) {
                throw {
                    index: 0,
                    src: 'email',
                    message: response.message,
                } as IndexedValidationError;
            } else if (response instanceof ApiResponse) {
                setForgotPasswordStatus('succeeded');
            }
        } catch (error) {
            setForgotPasswordStatus('failed');
            forgotPasswordErrorHandler(error);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            emailRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
        forgotPasswordStatus,
    };
};


import { logMessage } from '../../../utils/log.util';

export const useGoogle = () => {
    const signUpWithGoogle = async () => {
        logMessage('Sign up with Google')
    };

    return {
        signUpWithGoogle,
    };
};


import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, validateAll, validateEmail, validatePassword } from '@syncspace/shared';
// impoting features
import { cleanup, login } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { AppDispatch, FormState, RootState } from '../../../types';
import type { LoginField } from '../types';
// impoting reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useAuthModal } from './useAuthModal';

export const useLoginForm = () => {
    const dispatch = useDispatch<AppDispatch>();

    const loginStatus = useSelector((state: RootState) => state.user.status.login);
    const loginError = useSelector((state: RootState) => state.user.error.login);

    const { closeAuthModal } = useAuthModal();

    const isMobile = useMobile();
    const showErrorSnackBar = useErrorSnackBar();

    const initialFormState: FormState<LoginField> = createInitialFormState(['email', 'password']);
    const [formData, formDispatch] = useReducer(formReducer<LoginField>, initialFormState);
    const { email, password } = formData;
    const onChange = useMemo(() => handleFormDataChange<LoginField>(formDispatch), []);

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const refs = { emailRef, passwordRef };

    const loginErrorHandler = createErrorHandler<LoginField>(formDispatch, [emailRef, passwordRef]);

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (loginStatus === 'loading') {
                return;
            }

            const credentialsValidity = validateAll(validateEmail(email.value), validatePassword(password.value));
            if (credentialsValidity !== true) {
                throw credentialsValidity;
            }

            dispatch(login({
                email: email.value,
                password: password.value,
            }));
        } catch (error) {
            loginErrorHandler(error);
        }
    };

    useEffect(() => {
        if (loginStatus === 'succeeded') {
            closeAuthModal();
            dispatch(cleanup('login'));
        }

        if (loginStatus === 'failed' && loginError) {
            showErrorSnackBar(new ApiError(loginError));
            dispatch(cleanup('login'));
        }
    }, [loginStatus, loginError]);

    useEffect(() => {
        if (!isMobile) {
            emailRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        refs,
        showPassword,
        setShowPassword,
        handleLogin,
    };
};


import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, ApiResponse, validateAll, validateEmail, validatePassword, validateUsername } from '@syncspace/shared';
// impoting features
import { cleanup, register } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { AppDispatch, FileState, FormState, RootState } from '../../../types';
import type { AvailabilityState, RegisterFileField, RegisterFormField, RegisterFormPhase } from '../types';
// impoting reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
import { createInitialFileState, fileReducer } from '../../../reducers/file.reducer';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useAuthModal } from './useAuthModal';
// impoting services
import {
    isEmailAvailable as isEmailAvailableService,
    isUsernameAvailable as isUsernameAvailableService,
} from '../services/api.service';

export const useRegisterForm = () => {
    const dispatch = useDispatch<AppDispatch>();

    const startupSetting = useSelector((state: RootState) => state.user.user.setting.startupSetting);
    const registerStatus = useSelector((state: RootState) => state.user.status.register);
    const registerError = useSelector((state: RootState) => state.user.error.register);

    const { closeAuthModal } = useAuthModal();

    const showErrorSnackBar = useErrorSnackBar();

    const [phase, setPhase] = useState<RegisterFormPhase>('CREDENTIALS');

    const naviagteToCredentialsPhase = () => {
        setPhase('CREDENTIALS');
    };

    const naviagteToProfilePhase = () => {
        setPhase('PROFILE');
    };

    const initialFormState: FormState<RegisterFormField> = createInitialFormState(['email', 'password', 'username']);
    const [formData, formDispatch] = useReducer(formReducer<RegisterFormField>, initialFormState);
    const { email, password, username } = formData;
    const onChange = useMemo(() => handleFormDataChange<RegisterFormField>(formDispatch), []);

    const initialFileState: FileState<RegisterFileField> = createInitialFileState(['profilePic']);
    const [fileData, fileDispatch] = useReducer(fileReducer<RegisterFileField>, initialFileState);
    const { profilePic } = fileData;

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const refs = { emailRef, passwordRef, usernameRef };

    const registerErrorHandler = createErrorHandler<RegisterFormField>(formDispatch, [emailRef, passwordRef, usernameRef]);

    const [showPassword, setShowPassword] = useState(false);

    const [emailAvailability, setEmailAvailability] = useState<AvailabilityState>(undefined);
    const validateEmailAvailability = async () => {
        setEmailAvailability(undefined);

        const emailValidity = validateEmail(email.value);
        if (emailValidity !== true) {
            setEmailAvailability(false);
            return {
                index: 0,
                src: 'email',
                message: emailValidity.message,
            } as IndexedValidationError;
        }

        const response = await isEmailAvailableService({ email: email.value });
        if (response instanceof ApiError) {
            setEmailAvailability(false);
            return {
                index: 0,
                src: 'email',
                message: response.message,
            } as IndexedValidationError;
        } else if (response instanceof ApiResponse) {
            setEmailAvailability(true);
        }

        return true;
    };

    const [usernameAvailability, setUsernameAvailability] = useState<AvailabilityState>(undefined);
    const validateUsernameAvailability = async () => {
        setUsernameAvailability(undefined);

        const usernameValidity = validateUsername(username.value);
        if (usernameValidity !== true) {
            setUsernameAvailability(false);
            return {
                index: 2,
                src: 'username',
                message: usernameValidity.message,
            } as IndexedValidationError;
        }

        const response = await isUsernameAvailableService({ username: username.value });
        if (response instanceof ApiError) {
            setUsernameAvailability(false);
            return {
                index: 2,
                src: 'username',
                message: response.message,
            } as IndexedValidationError;
        } else if (response instanceof ApiResponse) {
            setUsernameAvailability(true);
        }

        return true;
    };

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (registerStatus === 'loading') {
                return;
            }

            const credentialsPhaseValidity = validateAll(validateEmail(email.value), validatePassword(password.value));
            if (credentialsPhaseValidity !== true) {
                throw credentialsPhaseValidity;
            }

            const emailValidity = await validateEmailAvailability();
            if (emailValidity !== true) {
                throw emailValidity;
            }

            if (phase === 'CREDENTIALS') {
                return naviagteToProfilePhase();
            }

            const profilePhaseValidity = validateAll(validateUsername(username.value));
            if (profilePhaseValidity !== true) {
                throw profilePhaseValidity;
            }

            const usernameValidity = await validateUsernameAvailability();
            if (usernameValidity !== true) {
                throw usernameValidity;
            }

            dispatch(register({
                email: email.value,
                password: password.value,
                username: username.value,
                profilePic: profilePic.file,
                startupSettingStr: JSON.stringify(startupSetting),
            }));
        } catch (error) {
            registerErrorHandler(error);
        }
    };

    useEffect(() => {
        if (registerStatus === 'succeeded') {
            closeAuthModal();
            dispatch(cleanup('register'));
        }

        if (registerStatus === 'failed' && registerError) {
            showErrorSnackBar(new ApiError(registerError));
            dispatch(cleanup('register'));
        }
    }, [registerStatus, registerError]);

    return {
        formData,
        formDispatch,
        onChange,
        fileData,
        fileDispatch,
        refs,
        showPassword,
        setShowPassword,
        emailAvailability,
        validateEmailAvailability,
        usernameAvailability,
        validateUsernameAvailability,
        handleRegister,
        phase,
        naviagteToCredentialsPhase,
        naviagteToProfilePhase,
    };
};


// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { ForgotPasswordParams, IsEmailAvailableParams, IsUsernameAvailableParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const isEmailAvailable = (
    params: IsEmailAvailableParams
) => apiHandler(() => API.get('/auth/isEmailAvailable', { params }));

export const isUsernameAvailable = (
    params: IsUsernameAvailableParams
) => apiHandler(() => API.get('/auth/isUsernameAvailable', { params }));

export const forgotPassword = (
    body: ForgotPasswordParams,
) => apiHandler(() => API.post('/auth/forgotPassword', body));


// importing types
import type { MouseEvent, ReactNode } from 'react';
import type { ButtonProps } from '@mui/material';
import type { AuthMode } from '../AuthModal.type';

export type AuthFooterProps = {
    authMode: AuthMode,
    toggleAuthModal: (event: MouseEvent) => void
};

export type AuthCaptionProps = AuthFooterProps;

export type AuthProvidersProps = {
    signUpWithGoogle: () => void,
    signUpWithFacebook: () => void,
};

export type StyledAuthProviderButtonProps = {
    provider: string,
    icon: ReactNode,
    sx?: object,
} & ButtonProps;


// importing types
import type { LordIconProps } from '../../../../../types';

export type AuthHeaderProps = {
    lordIcon: Partial<LordIconProps>,
    heading: string,
    subHeading: string,
};


export type SubmitButtonProps = {
    label: string,
    submitting: boolean,
};


export type AuthMode = 'login' | 'register';

export type AuthModalProps = {
    authMode: AuthMode,
    fullPage?: boolean, 
};


export type LoginFormProps = {
    toggleAuthModal: () => void,
};


// importing types
import type { ActionDispatch, ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react';
import type { ValidationError } from '@syncspace/shared';
import type { FormAction, FormFieldState } from '../../../../types';
import type { AvailabilityState, RegisterFormField } from '../hooks/useRegister.type';

export type RegisterCredentialsFormProps = {
    email: FormFieldState,
    password: FormFieldState,
    emailRef: RefObject<HTMLInputElement | null>,
    passwordRef: RefObject<HTMLInputElement | null>,
    formDispatch: ActionDispatch<[action: FormAction<RegisterFormField>]>,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    showPassword: boolean,
    setShowPassword: Dispatch<SetStateAction<boolean>>,
    emailAvailability: AvailabilityState,
    validateEmailAvailability: () => Promise<true | ValidationError>,
    submitting: boolean,
};


export type RegisterFormProps = {
    toggleAuthModal: () => void,
};


// importing types
import type { ActionDispatch, ChangeEvent, RefObject } from 'react';
import type { ValidationError } from '@syncspace/shared';
import type { FormAction, FileFieldState, FormFieldState, FileAction } from '../../../../types';
import type { AvailabilityState, RegisterFileField, RegisterFormField } from '../hooks/useRegister.type';

export type RegisterProfileFormProps = {
    username: FormFieldState,
    profilePic: FileFieldState,
    usernameRef: RefObject<HTMLInputElement | null>,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
    formDispatch: ActionDispatch<[action: FormAction<RegisterFormField>]>,
    fileDispatch: ActionDispatch<[action: FileAction<RegisterFileField>]>,
    usernameAvailability: AvailabilityState,
    validateUsernameAvailability: () => Promise<true | ValidationError>,
    submitting: boolean,
};


export type ForgotPasswordField = 'email';


export type LoginField = 'email' | 'password';


export type RegisterFormPhase = 'CREDENTIALS' | 'PROFILE';

export type RegisterFormField = 'email' | 'password' | 'username';
export type RegisterFileField = 'profilePic';

export type AvailabilityState = boolean | undefined;


export type IsEmailAvailableParams = {
    email: string,
};

export type IsUsernameAvailableParams = {
    username: string,
};

export type ForgotPasswordParams = {
    email: string,
};


export * from './components/ui/AuthHeader.type';
export * from './components/ui/AuthFooter.type';
export * from './components/AuthModal.type';
export * from './components/LoginForm.type';
export * from './components/RegisterCredentialsForm.type';
export * from './components/RegisterForm.type';
export * from './components/RegisterProfileForm.type';
export * from './components/ui/SubmitButton.type';

export * from './hooks/useForgotPassword.type';
export * from './hooks/useLogin.type';
export * from './hooks/useRegister.type';

export * from './services/api.service.type';


// exporting hooks
export { useAuthModal } from './hooks/useAuthModal';
// exporting components
export { AuthModal } from './components/AuthModal';


import { useSelector } from 'react-redux';
import { validateNewPassword } from '@syncspace/shared';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
// importing icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing types
import type { ResetPasswordFormProps } from '../types';
import type { RootState } from '../../../types';
// importing hooks
import { useResetPassword } from '../hooks/useResetPassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { GenericAuthModal } from '../../../components/GenericAuthModal';
import { FormTextField } from '../../../components/FormTextField';

export const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const { token } = props;

    const resetPasswordStatus = useSelector((state: RootState) => state.user.status.resetPassword);

    const {
        formData,
        formDispatch,
        onChange,
        newPasswordRef,
        showPassword,
        setShowPassword,
        handleResetPassword,
    } = useResetPassword(token);

    const { newPassword } = formData;

    return (
        <GenericAuthModal
            heading="Reset Password"
            lordicon={{ src: 'https://cdn.lordicon.com/dicvhxpz.json' }}
            subHeading="Enter a new password to reset your account."
            sx={{ p: 4, bgcolor: 'background.default' }}
        >
            <CenteredBox
                component="form"
                sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                onSubmit={handleResetPassword}
            >
                <FormTextField
                    name="newPassword"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    data={newPassword}
                    submitting={resetPasswordStatus === 'loading'}
                    onChange={onChange}
                    inputRef={newPasswordRef}
                    dispatch={formDispatch}
                    validate={validateNewPassword}
                    required
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment
                                    position='end'
                                    onClick={() => setShowPassword(!showPassword)}
                                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                >
                                    {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Button
                    type='submit'
                    variant='contained'
                    disabled={resetPasswordStatus === 'loading'}
                    fullWidth
                    color='primary'
                >
                    Reset Password
                </Button>
            </CenteredBox>
        </GenericAuthModal>
    );
};


// importing types
import type { UpdateEmailPromptProps } from "../types";

export const UpdateEmailPrompt = (props: UpdateEmailPromptProps) => {
    const { token } = props;

    return (
        <div>
            {token}
        </div>
    );
};


// importing types;
import type { VerifyEmailPromptProps } from "../types";

export const VerifyEmailPrompt = (props: VerifyEmailPromptProps) => {
    const { token } = props;

    return (
        <div>
            {token}
        </div>
    );
};


import { Navigate, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
// importing icons
import ResetTokenExpiredIcon from '@mui/icons-material/CloseRounded';
// importing types
import type { EmailHandlerProps } from '../types';
// importing hooks
import { useDecodeToken } from '../hooks/useDecodeToken';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { GenericAuthModal } from '../../../components/GenericAuthModal';
import { LoadingModal } from '../../../components/LoadingModal';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { UpdateEmailPrompt } from '../components/UpdateEmailPrompt';
import { VerifyEmailPrompt } from '../components/VerifyEmailPrompt';

export const EmailHandler = (props: EmailHandlerProps) => {
    const { action, token } = props;

    const navigate = useNavigate();

    const { status } = useDecodeToken(action, token);

    if (status === 'loading') {
        return <LoadingModal loader={{ progress: 'linear', size: 360 }} children="Fetching..." />;
    }

    if (status === 'failed') {
        const actionLabel = action === 'resetPassword' ? 'password reset' :
            action === 'verifyEmail' ? 'email verification' :
                action === 'updateEmail' ? 'email update' :
                    'link';

        return (
            <GenericAuthModal
                heading="Link has expired"
                subHeading={`Your ${actionLabel} link is invalid or expired. Please retry the process to receive a new link.`}
                sx={{ p: 4, bgcolor: 'background.default' }}
                customIcon={<ResetTokenExpiredIcon />}
            >
                <CenteredBox sx={{ flexDirection: 'column', gap: 1.25, width: '100%' }}>
                    <Button variant="contained" fullWidth onClick={() => navigate('/auth/login')}>
                        Go to Login
                    </Button>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                </CenteredBox>
            </GenericAuthModal>
        );
    }

    switch (action) {
        case 'resetPassword':
            return <ResetPasswordForm token={token} />;
        case 'updateEmail':
            return <UpdateEmailPrompt token={token} />;
        case 'verifyEmail':
            return <VerifyEmailPrompt token={token} />;
        default:
            return <Navigate to='/' replace />;
    }
};


import { useEffect, useState } from 'react';
import { ApiError, ApiResponse, TokenActions } from '@syncspace/shared';
// importing types
import type { TokenAction } from '@syncspace/shared';
import type { ApiCallStatus } from '../../../types';
// importing services
import {
    decodeToken as decodeTokenService,
} from '../services/api.service';

export const useDecodeToken = (action: string, token: string) => {
    const [status, setStatus] = useState<ApiCallStatus>('loading');

    useEffect(() => {
        const decode = async (action: TokenAction) => {
            const response = await decodeTokenService({ action, token });

            if (response instanceof ApiError) {
                setStatus('failed');
            } else if (response instanceof ApiResponse) {
                setStatus('succeeded');
            }
        };

        if (TokenActions.includes(action as TokenAction)) {
            decode(action as TokenAction);
        } else {
            setStatus('failed');
        }
    }, [action, token]);

    return {
        status,
    };
};


import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiError, validateAll, validateNewPassword } from '@syncspace/shared';
// importing types
import type { FormEvent } from 'react';
import type { ResetPasswordField } from '../types';
import type { AppDispatch, FormState, RootState } from '../../../types';
// importing features
import { cleanup, resetPassword } from '../../user';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useMobile } from '../../../hooks/useMobile';
// importing reducers
import {
    createErrorHandler,
    createInitialFormState,
    formReducer,
    handleFormDataChange,
} from '../../../reducers/form.reducer';

export const useResetPassword = (token: string) => {
    const dispatch = useDispatch<AppDispatch>();

    const resetPasswordStatus = useSelector((state: RootState) => state.user.status.resetPassword);
    const resetPasswordError = useSelector((state: RootState) => state.user.error.resetPassword);

    const navigate = useNavigate();

    const isMobile = useMobile();
    const showErrorSnackBar = useErrorSnackBar();

    const initialFormState: FormState<ResetPasswordField> = createInitialFormState(['newPassword']);
    const [formData, formDispatch] = useReducer(formReducer<ResetPasswordField>, initialFormState);
    const { newPassword } = formData;

    const [showPassword, setShowPassword] = useState(false);

    const onChange = useMemo(() => handleFormDataChange<ResetPasswordField>(formDispatch), []);

    const newPasswordRef = useRef<HTMLInputElement | null>(null);

    const resetPasswordErrorHandler = createErrorHandler<ResetPasswordField>(formDispatch, [newPasswordRef]);

    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (resetPasswordStatus === 'loading') {
                return;
            }

            const validity = validateAll(validateNewPassword(newPassword.value));
            if (validity !== true) {
                throw validity;
            }

            dispatch(resetPassword({
                resetPasswordToken: token,
                newPassword: newPassword.value,
            }));
        } catch (error) {
            resetPasswordErrorHandler(error);
        }
    };

    useEffect(() => {
        if (resetPasswordStatus === 'succeeded') {
            dispatch(cleanup('resetPassword'));
            navigate('/', { replace: true });
        }

        if (resetPasswordStatus === 'failed' && resetPasswordError) {
            showErrorSnackBar(new ApiError(resetPasswordError));
            dispatch(cleanup('resetPassword'));
        }
    }, [resetPasswordStatus, resetPasswordError]);

    useEffect(() => {
        if (!isMobile) {
            newPasswordRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        newPasswordRef,
        showPassword,
        setShowPassword,
        handleResetPassword,
    };
};



// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { DecodeTokenParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const decodeToken = (
    body: DecodeTokenParams,
) => apiHandler(() => API.post('/token/decodeToken', body));


// importing types
import type { EmailComponentProps } from "../core/EmailHandler.type";

export type ResetPasswordFormProps = EmailComponentProps;

export type ResetPasswordField = 'newPassword';


// importing types
import type { EmailComponentProps } from "../core/EmailHandler.type";

export type UpdateEmailPromptProps = EmailComponentProps;


// importing types
import type { EmailComponentProps } from "../core/EmailHandler.type";

export type VerifyEmailPromptProps = EmailComponentProps;


export type EmailHandlerProps = {
    action: string;
    token: string;
};

export type EmailComponentProps = {
    token: string,
};


// importing types
import type { TokenAction } from "@syncspace/shared";

export type DecodeTokenParams = {
    action: TokenAction,
    token: string,
};


export * from './components/ResetPasswordForm.type';
export * from './components/UpdateEmailPrompt.type';
export * from './components/VerifyEmailPrompt.type';

export * from './core/EmailHandler.type';

export * from './services/api.service.type';


export { EmailHandler } from "./core/EmailHandler";


import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
// importing features
import { useAuthModal } from '../../auth';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing types
import type { StyledNavBarButtonProps } from '../types';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';

export const AuthActions = () => {
    const { openAuthModal } = useAuthModal();

    const { pathname } = useLocation();

    const { authPathRegex } = clientConfig;

    if (authPathRegex.test(pathname)) {
        return null;
    }

    return (
        <CenteredBox sx={{ gap: 2 }}>
            <StyledNavBarButton
                label='Log in'
                onClick={() => openAuthModal('login')}
                sx={{
                    color: 'text.primary',
                    px: 2,
                    border: '0.5px solid',
                    borderColor: 'text.secondary',
                }}
            />
            <StyledNavBarButton
                label='Register'
                variant='contained'
                color='primary'
                onClick={() => openAuthModal('register')}
            />
        </CenteredBox>
    );
};

const StyledNavBarButton = (props: StyledNavBarButtonProps) => {
    const { label, ...rest } = props;

    return (
        <Button size='small' {...rest} >
            {label}
        </Button>
    );
};


import { useSelector } from 'react-redux';
import { Link as NavigateLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing features
import { useSettingModal } from '../../setting';
// importing types
import type { RootState } from '../../../types';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { Logo } from '../../../components/Logo';
import { ToolTip } from '../../../components/ToolTip';
import { AuthActions } from './AuthActions';
import { ProfileMenu } from './ProfileMenu';
import { SearchBar } from './SearchBar';

export const NavBar = () => {
    const { navbarHeightPx } = clientConfig;

    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const { openSettingModal } = useSettingModal();

    return (
        <CenteredBox sx={{
            justifyContent: 'space-between',
            height: `${navbarHeightPx}px`,
            width: '100%',
            position: 'fixed',
            top: 0, 
            px: 4,
            color: 'text.primary',
            bgcolor: 'background.default',
        }}>
            <CenteredBox sx={{ justifyContent: 'start', width: '25%' }}>
                <NavigateLink to='/'>
                    <Logo />
                </NavigateLink>
            </CenteredBox>

            <SearchBar sx={{ width: '50%', }} />

            <CenteredBox sx={{ justifyContent: 'end', width: '25%', gap: 1 }}>
                {isLoggedIn
                    ? <ProfileMenu />
                    : <AuthActions />
                }
                <ToolTip title='Settings'>
                    <IconButton onClick={openSettingModal}>
                        <SettingsIcon fontSize='small' />
                    </IconButton>
                </ToolTip>
            </CenteredBox>
        </CenteredBox>
    );
};


import { useSelector } from 'react-redux';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
// importing icons
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileIcon from '@mui/icons-material/Person';
// importing types
import type { RootState } from '../../../types';
// importing hooks
import { useProfileMenu } from '../hooks/useProfileMenu';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { ToolTip } from '../../../components/ToolTip';

export const ProfileMenu = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const logoutStatus = useSelector((state: RootState) => state.user.status.logout);

    const {
        openMenu,
        anchorEl,
        handleOpenMenu,
        handleCloseMenu,
        handleNavigateToProfile,
        handleLogout,
    } = useProfileMenu();

    return (
        <>
            <CenteredBox sx={{ textAlign: 'center' }}>
                <ToolTip title='Open Profile Menu'>
                    <IconButton size='small' onClick={handleOpenMenu}>
                        <Avatar
                            sx={{
                                height: '32px',
                                width: '32px',
                                color: 'primary.contrastText',
                                bgcolor: 'primary.main',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                '&:hover': { borderColor: 'primary.dark' }
                            }}
                            src={user.profilePic && user.profilePic.lowRes.url}
                        >
                            {user.username.charAt(0)}
                        </Avatar>
                    </IconButton>
                </ToolTip>
            </CenteredBox>
            <Menu
                anchorEl={anchorEl}
                id='account-menu'
                open={openMenu}
                onClose={handleCloseMenu}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: `''`,
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                    list: {
                        sx: { py: 0 },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableScrollLock={true}
            >
                <MenuItem onClick={handleNavigateToProfile}>
                    <ListItemIcon>
                        <ProfileIcon fontSize='small' />
                    </ListItemIcon>
                    Profile
                </MenuItem>

                <Divider sx={{ m: '0px !important' }} />

                <MenuItem onClick={handleLogout} sx={{ position: 'relative' }}>
                    <ListItemIcon>
                        <LogoutIcon fontSize='small' />
                    </ListItemIcon>
                    Logout
                    {logoutStatus === 'loading' &&
                        <LinearProgress sx={{ position: 'absolute', left: 0, bottom: 0, width: '100%' }} />
                    }
                </MenuItem>
            </Menu>
        </>
    );
};


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


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@syncspace/shared';
// importing features
import { cleanup, logout } from '../../user';
// importing types
import type { MouseEvent } from 'react';
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';

export const useProfileMenu = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.user.user);
    const logoutStatus = useSelector((state: RootState) => state.user.status.logout);
    const logoutError = useSelector((state: RootState) => state.user.error.logout);

    const showErrorSnackBar = useErrorSnackBar();

    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleNavigateToProfile = () => {
        navigate(`/profile/${user.username}`);
        handleCloseMenu();
    };

    const handleLogout = async () => {
        dispatch(logout())
    };

    useEffect(() => {
        if (logoutStatus === 'succeeded') {
            handleCloseMenu();
            dispatch(cleanup('logout'));
            navigate('/');
        }
        
        if (logoutStatus === 'failed' && logoutError) {
            showErrorSnackBar(new ApiError(logoutError));
            dispatch(cleanup('logout'));
        }
    }, [logoutStatus, logoutError]);

    return {
        openMenu,
        anchorEl,
        handleOpenMenu,
        handleCloseMenu,
        handleNavigateToProfile,
        handleLogout,
    };
};


// importing types
import type { ButtonProps } from '@mui/material';

export type StyledNavBarButtonProps = {
    label: string,
} & ButtonProps;


export type SearchBarProps = {
    sx?: object,
};


export * from './components/AuthActions.type';
export * from './components/SearchBar.type';


// exporting components
export { NavBar } from './components/NavBar';


// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { FetchInteractionsParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const fetchInteractions = (
    params: FetchInteractionsParams
) => apiHandler(() => API.get('/interaction/fetchInteractions', {
    params,
    paramsSerializer: (p) => {
        const searchParams = new URLSearchParams();

        Object.entries(p).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => searchParams.append(key, String(v)));
            } else if (value !== undefined && value !== null) {
                searchParams.set(key, String(value));
            }
        });

        return searchParams.toString();
    },
}));


// importing types
import type { TargetType } from '@syncspace/shared';

export type FetchInteractionsParams = {
    page: number,
    sortOrder: 'asc' | 'desc';
    targets?: TargetType | TargetType[],
};


export * from './services/api.service.type';


import { useSelector } from 'react-redux';
import { validatePassword } from '@syncspace/shared';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
// importing icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing types
import type { RootState } from '../../../types';
// importing hooks
import { useReauth } from '../hooks/useReauth';
import { useReauthModal } from '../hooks/useReauthModal';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { GenericAuthModal } from '../../../components/GenericAuthModal';

export const ReauthModal = () => {
    const reauthStatus = useSelector((state: RootState) => state.user.status.reauth);

    const {
        formData,
        formDispatch,
        onChange,
        passwordRef,
        showPassword,
        setShowPassword,
        handleReauth,
    } = useReauth();
    const { closeReauthModal } = useReauthModal();

    const { password } = formData;

    return (
        <GenericAuthModal
            heading='Reauth'
            subHeading='Enter your password to continue'
            lordicon={{ src: 'https://cdn.lordicon.com/dicvhxpz.json' }}
        >
            <CenteredBox
                component='form'
                sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                onSubmit={handleReauth}
            >
                <FormTextField
                    name='password'
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    data={password}
                    submitting={reauthStatus === 'loading'}
                    onChange={onChange}
                    inputRef={passwordRef}
                    dispatch={formDispatch}
                    validate={validatePassword}
                    required
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment
                                    position='end'
                                    onClick={() => setShowPassword(!showPassword)}
                                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                >
                                    {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <CenteredBox sx={{ gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                    <Button variant='outlined' onClick={closeReauthModal}>Cancel</Button>
                    <Button type='submit' variant='contained'>Ok</Button>
                </CenteredBox>
            </CenteredBox>
        </GenericAuthModal>
    );
};


import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateAll, validatePassword } from '@syncspace/shared';
// importing features
import { reauth } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { AppDispatch, FormState, RootState } from '../../../types';
import type { ReauthField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';

export const useReauth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const reauthStatus = useSelector((state: RootState) => state.user.status.reauth);

    const isMobile = useMobile();

    const initialFormState: FormState<ReauthField> = createInitialFormState(['password']);
    const [formData, formDispatch] = useReducer(formReducer<ReauthField>, initialFormState);
    const { password } = formData;
    const onChange = useMemo(() => handleFormDataChange<ReauthField>(formDispatch), []);

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const reauthErrorHandler = createErrorHandler<ReauthField>(formDispatch, [passwordRef]);

    const [showPassword, setShowPassword] = useState(false);

    const handleReauth = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (reauthStatus === 'loading') {
                return;
            }

            const credentialsValidity = validateAll(validatePassword(password.value));
            if (credentialsValidity !== true) {
                throw credentialsValidity;
            }

            dispatch(reauth({ password: password.value }))
        } catch (error) {
            reauthErrorHandler(error);
        }
    };

    useEffect(() => {
        if (!isMobile) {
            passwordRef.current?.focus();
        }
    }, [isMobile]);

    return {
        formData,
        formDispatch,
        onChange,
        passwordRef,
        showPassword,
        setShowPassword,
        handleReauth,
    };
};


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, ApiResponse } from '@syncspace/shared';
// importing features
import { cleanup, closeReauth, retryRegistry } from '../../user';
// importing type
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useReauthModal } from './useReauthModal';
// importing utils
import { reauthCallbackRegistry } from '../utils/reauthCallbackRegistry.util';

export const useReauthListener = () => {
    const dispatch = useDispatch<AppDispatch>();

    const reauthMeta = useSelector((state: RootState) => state.user.reauthMeta);
    const reauthStatus = useSelector((state: RootState) => state.user.status.reauth);
    const reauthError = useSelector((state: RootState) => state.user.error.reauth);

    const showErrorSnackBar = useErrorSnackBar();
    const { openReauthModal, closeReauthModal } = useReauthModal();

    useEffect(() => {
        if (!reauthMeta) {
            return;
        }

        if (reauthMeta.active) {
            openReauthModal();
        }
    }, [reauthMeta]);

    const handleRedoRequest = async () => {
        if (reauthMeta?.retryMeta) {
            const { reauthService, args, callbackId } = reauthMeta.retryMeta;

            const retryFn = retryRegistry[reauthService];
            const response = await retryFn(args, dispatch);

            if (callbackId) {
                const callbacks = reauthCallbackRegistry.get(callbackId);
                reauthCallbackRegistry.delete(callbackId);

                if (response instanceof ApiError) {
                    await callbacks?.onError?.(response);
                } else if (response instanceof ApiResponse) {
                    await callbacks?.onSuccess?.(response);
                }
            }

            closeReauthModal();
            dispatch(closeReauth());
            dispatch(cleanup('reauth'));
        }
    };

    useEffect(() => {
        if (reauthStatus === 'succeeded') {
            handleRedoRequest();
        }

        if (reauthStatus === 'failed' && reauthError) {
            showErrorSnackBar(new ApiError(reauthError));
            dispatch(cleanup('reauth'));
        }
    }, [reauthStatus, reauthError]);
};


// importing contexts
import { useModalContext } from '../../../contexts/modal.context';
// importing components
import { ReauthModal } from '../component/ReauthModal';

export const useReauthModal = () => {
    const { openModal, closeModal } = useModalContext();

    const openReauthModal = () => {
        openModal({
            id: 'reauth',
            isPersistent: true,
            hideTitle: true,
            modalContent: {
                body: <ReauthModal />
            },
            unstyled: true,
        });
    };


    const closeReauthModal = () => {
        closeModal('reauth');
    };

    return {
        openReauthModal,
        closeReauthModal,
    };
};


export type ReauthField = 'password';


export * from './hooks/useReauth.type';


// importing types
import type { ApiError, ApiResponse } from "@syncspace/shared";

export const reauthCallbackRegistry = new Map<
    string,
    {
        onSuccess?: (response: ApiResponse) => void | Promise<void>;
        onError?: (error: ApiError) => void | Promise<void>
    }
>();


// exporting hooks
export * from './hooks/useReauthListener';
// exporting utils
export { reauthCallbackRegistry } from './utils/reauthCallbackRegistry.util'; 


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


import Typography from '@mui/material/Typography';
// importing types
import type { SectionCaptionProps, SectionHeadingProps, SectionSubHeadingProps } from '../../types';

export const SectionHeading = (props: SectionHeadingProps) => {
    const { text, ...rest } = props;

    return (
        <Typography variant='h6' component='h6' {...rest}>
            {text}
        </Typography>
    );
};

export const SectionSubHeading = (props: SectionSubHeadingProps) => {
    const { text, ...rest } = props;

    return (
        <Typography variant='subtitle2' {...rest}>
            {text}
        </Typography>
    );
};

export const SectionCaption = (props: SectionCaptionProps) => {
    const { text, sx, ...rest } = props;

    return (
        <Typography variant='subtitle1' color='text.secondary' fontSize='small' sx={{ mb: 1.5, ...sx }} {...rest}>
            {text}
        </Typography>
    );
};


import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
// importing types
import type { ThemePreviewCardProps } from '../../types';
// importing components
import { CenteredBox } from '../../../../components/CenteredBox';

export const ThemePreviewCard = (props: ThemePreviewCardProps) => {
    const { label, selected, theme, onSelect } = props;

    if (!theme) return null;

    const borderColor = selected ? 'primary.main' : 'divider';
    const bgPaper = theme.background!.paper;
    const bgDefault = theme.background!.default;
    const primaryMain = (theme.primary as { main: string }).main;
    const divider = theme.divider;
    const textPrimary = theme.text!.primary;
    const textSecondary = theme.text!.secondary;

    return (
        <Box>
            <CenteredBox
                onClick={onSelect}
                sx={{
                    flexDirection: 'column',
                    gap: 0.5,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: bgDefault,
                    p: 1,
                    border: '2px solid',
                    borderColor,
                    borderRadius: 2,
                    boxShadow: selected ? 3 : 1,
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4, borderColor: 'primary.light' },
                }}
            >
                <CenteredBox sx={{ justifyContent: 'space-between', width: '100%', mb: 2 }}>
                    <CenteredBox sx={{ gap: 0.5, width: '20%' }}>
                        <Box sx={{ height: 12, width: '50%', bgcolor: bgPaper, border: '1px solid', borderColor: divider, borderRadius: 8 }} />
                        <Box sx={{ height: 12, width: '50%', bgcolor: bgPaper, border: '1px solid', borderColor: divider, borderRadius: 8 }} />
                    </CenteredBox>
                    <Box sx={{ height: 12, width: '40%', bgcolor: bgDefault, border: '1px solid', borderColor: divider, borderRadius: 8 }} />
                    <CenteredBox sx={{ gap: 0.5, width: '25%' }}>
                        <Box sx={{ height: 12, width: '50%', bgcolor: bgDefault, border: '1px solid', borderColor: textPrimary, borderRadius: '2px' }} />
                        <Box sx={{ height: 12, width: '50%', bgcolor: primaryMain, borderRadius: '2px' }} />
                        <Box sx={{ position: 'relative' }}>
                            <Box sx={{ height: 12, width: 12, bgcolor: bgPaper, border: '1px solid', borderColor: divider, borderRadius: '50%' }} />
                            <Box sx={{ height: 4, width: 4, position: 'absolute', top: 0, right: 0, bgcolor: primaryMain, borderRadius: '50%' }} />
                        </Box>
                    </CenteredBox>
                </CenteredBox>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '20%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '100%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '100%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '100%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '45%', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ height: 8, bgcolor: bgPaper, width: '10%', borderRadius: 1, mb: 0.5 }} />
                </Box>
                <CenteredBox sx={{ gap: 0.5, width: '100%', mb: 2 }}>
                    <Box
                        sx={{
                            flexGrow: 1,
                            height: 16,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '2px',
                        }}
                    />
                    <Box sx={{ height: 16, width: 32, bgcolor: primaryMain, borderRadius: '2px' }} />
                </CenteredBox>
                <CenteredBox sx={{ gap: 0.5 }}>
                    <Box sx={{ height: 10, width: 20, bgcolor: primaryMain, border: '1px solid', borderColor: textSecondary, borderRadius: 1 }} />
                    <Box sx={{ height: 10, width: 20, bgcolor: bgPaper, border: '1px solid', borderColor: textSecondary, borderRadius: 1 }} />
                    <Box sx={{ height: 10, width: 20, bgcolor: bgPaper, border: '1px solid', borderColor: textSecondary, borderRadius: 1 }} />
                </CenteredBox>
            </CenteredBox>

            <CenteredBox sx={{ justifyContent: 'flex-start' }}>
                <Radio
                    checked={selected}
                    onChange={onSelect}
                    value={label}
                />
                <Typography
                    variant='body1'
                    sx={{ color: selected ? 'primary.main' : 'text.secondary' }}
                >
                    {label.charAt(0).toUpperCase()}{label.substring(1)}
                </Typography>
            </CenteredBox>
        </Box>
    );
};


import { useDispatch, useSelector } from 'react-redux';
import { validatePassword } from '@syncspace/shared';
// importing mui components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// importing mui icons
import EmailVerifiedIcon from '@mui/icons-material/CheckCircle';
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing features
import { determineReauth, verifyEmail } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useSettingModal } from '../hooks/useSettingModal';
import { useDeleteAccount } from '../hooks/useDeleteAccount';
import { useChangePassword } from '../hooks/useChangePassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { SectionCaption, SectionHeading, SectionSubHeading } from './ui/SettingTypography';
import { ToolTip } from '../../../components/ToolTip';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import { useDetermineReauth } from '../hooks/useDetermineReauth';

export const AccountSetting = () => {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.user.user);
    const changePasswordStatus = useSelector((state: RootState) => state.user.status.changePassword);
    const verifyEmailStatus = useSelector((state: RootState) => state.user.status.verifyEmail);

    const { openDeleteAccountModal } = useSettingModal();

    const {
        formData,
        formDispatch,
        handleChangePassword,
        onChange,
        refs,
        setShowPassword,
        showPassword,
    } = useChangePassword();

    const { currentPassword, newPassword } = formData;
    const { currentPasswordRef, newPasswordRef } = refs;

    useDeleteAccount();

    const { initiateEmailVerification } = useVerifyEmail();

    const { determineReauthStatus } = useDetermineReauth();

    return (
        <Stack spacing={3}>
            <SectionHeading text='User [need good text]' />

            {/* TODO: should i make use of ABAC for these actions as in auth provider should be email */}
            <Box>
                <SectionSubHeading text='Verify email' />
                <SectionCaption text='verify email [need good text]' />

                <TextField
                    label="User Email"
                    defaultValue={user.email}
                    slotProps={{
                        input: {
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position='end'>
                                    {user.auth.isEmailVerified ?
                                        <ToolTip title='Email verified'>
                                            <EmailVerifiedIcon color='success' sx={{ cursor: 'pointer' }} />
                                        </ToolTip> :
                                        <Button variant='contained' onClick={initiateEmailVerification}>
                                            Verify email
                                        </Button>
                                    }
                                </InputAdornment>
                            ),
                        },
                    }}
                    fullWidth
                />
            </Box>

            <Box>
                <SectionSubHeading text='Update email' />
                <SectionCaption text='Update email [need good text]' />
            </Box>

            <Box>
                <SectionSubHeading text='Change Password' />
                <SectionCaption text='Update password [need good text]' />

                <CenteredBox component='form' onSubmit={handleChangePassword} sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <FormTextField
                        name='currentPassword'
                        label='Current Password'
                        type={showPassword.currentPassword ? 'text' : 'password'}
                        data={currentPassword}
                        submitting={changePasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={currentPasswordRef}
                        dispatch={formDispatch}
                        validate={validatePassword}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment
                                        position='end'
                                        onClick={() => setShowPassword({ ...showPassword, currentPassword: !showPassword.currentPassword })}
                                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                    >
                                        {showPassword.currentPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <FormTextField
                        name='newPassword'
                        label='New Password'
                        type={showPassword.newPassword ? 'text' : 'password'}
                        data={newPassword}
                        submitting={changePasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={newPasswordRef}
                        dispatch={formDispatch}
                        validate={validatePassword}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment
                                        position='end'
                                        onClick={() => setShowPassword({ ...showPassword, newPassword: !showPassword.newPassword })}
                                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                    >
                                        {showPassword.newPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        type='submit'
                        variant='contained'
                        disabled={changePasswordStatus === 'loading'}
                        color='primary'
                    >
                        Update
                    </Button>
                </CenteredBox>
            </Box>

            <Divider />

            <Box>
                <SectionSubHeading text='Delete Account' />
                <SectionCaption text='Once you delete your account, there is no going back. Please be certain.' />
                <Button variant='contained' color='error' onClick={openDeleteAccountModal}>Delete</Button>
            </Box>

            {/* TODO: either remove this or make it devloper only feature */}
            <Box>
                <SectionSubHeading text='Reauth Status' />
                <Button
                    variant='contained'
                    color={determineReauthStatus === 'failed' ?
                        'error' :
                        (determineReauthStatus === 'succeeded' ? 'success' : 'primary')}
                    onClick={() => dispatch(determineReauth())}
                >
                    Check Reauth
                </Button>
            </Box>
        </Stack>
    );
};


import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// importing components
import { HotkeyDisplay } from './ui/HotkeyDisplay';
import { SectionHeading, SectionSubHeading } from './ui/SettingTypography';

{/* TODO: map the key bindings for both windows and mac */ }
export const KeyBindingsSettings = () => {
    return (
        <Stack spacing={4}>
            <SectionHeading text='Keyboard Shortcuts' />

            <Box>
                <SectionSubHeading text='Application' />
                <Stack spacing={0.5}>
                    <HotkeyDisplay text='Open Settings' binding='Ctrl + ,' />
                    <HotkeyDisplay text='Focus Search' binding='Ctrl + `' last={true} />
                </Stack>
            </Box>
        </Stack>
    );
};


import Stack from '@mui/material/Stack';
// importing components
import { SectionSubHeading } from './ui/SettingTypography';

export const NotificationSetting = () => {
    return (
        <Stack spacing={3}>
            <SectionSubHeading text='All of it from `https://www.reddit.com/settings/notifications`' />
        </Stack>
    );
};


import { useDispatch, useSelector } from 'react-redux';
import { Themes } from '@syncspace/shared';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
// importing features
import { optimisticUpdateSetting, updateSetting } from '../../user';
// importing types
import type { FeedLayout, Theme } from '@syncspace/shared';
import type { AppDispatch, RootState } from '../../../types';
import type { FeedLayoutPreviewCardProps } from '../types';
// importing contexts
import { useThemeContext } from '../../../contexts/theme.context';
// importing components
import { SectionCaption, SectionHeading, SectionSubHeading } from './ui/SettingTypography';
import { ThemePreviewCard } from './ui/ThemePreviewCard';
import { SettingCheckBox } from './ui/SettingCheckBox';

export const PreferencesSetting = () => {
    const dispatch = useDispatch<AppDispatch>();

    const setting = useSelector((state: RootState) => state.user.user.setting);

    const { palette } = useThemeContext();

    const updateTheme = (theme: Theme) => {
        const updatedSetting = {
            ...setting,
            startupSetting: { ...setting.startupSetting, theme },
        };

        dispatch(optimisticUpdateSetting(updatedSetting));
        dispatch(updateSetting({ newSetting: updatedSetting }));
    };

    const updateFeedLayout = (feedLayout: FeedLayout) => {
        const updatedSetting = {
            ...setting,
            startupSetting: { ...setting.startupSetting, feedLayout },
        };

        dispatch(optimisticUpdateSetting(updatedSetting));
        dispatch(updateSetting({ newSetting: updatedSetting }));
    };

    return (
        <Stack spacing={3}>
            <SectionHeading text='Preferences' />
            <Box>
                <SectionSubHeading text='Theme' />
                <SectionCaption text='Personalize your experience with themes that match your style.' />

                <Grid container spacing={2}>
                    {Themes.map((theme, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                            <ThemePreviewCard
                                label={theme}
                                selected={setting.startupSetting.theme === theme}
                                theme={palette[theme as Theme]}
                                onSelect={() => updateTheme(theme as Theme)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <SettingCheckBox label='Show mature content' name='startupSetting.showMature' description='Allow posts marked as mature to appear in your feed.' />
            {/* TODO: When showMature is false then disable blurMature */}
            <SettingCheckBox label='Blur mature content' name='startupSetting.blurMature' description='Automatically blur images and thumbnails for mature posts until you choose to view them.' />

            <SectionSubHeading text='Update `Muted communities`' />

            <SettingCheckBox label='Autoplay media' name='startupSetting.autoplayMedia' description='Play videos automatically while scrolling through your feed.' />
            <SettingCheckBox label='Open post in new tab' name='startupSetting.openPostNewTab' description='Open posts in a separate browser tab instead of the current one.' />

            <Box>
                <SectionSubHeading text='Feed Layout' />
                <SectionCaption text='Personalize your experience with appropriate feed layout that match your style.' />

                <Grid container spacing={2}>
                    <FeedLayoutPreviewCard
                        feedLayout='card'
                        heading='Card Layout'
                        caption='Spacious design, great for browsing casually.'
                        setting={setting}
                        n={2}
                        onClickFunction={() => updateFeedLayout('card')}
                    />

                    <FeedLayoutPreviewCard
                        feedLayout='compact'
                        heading='Compact Layout'
                        caption='Condensed view, optimized for fast information.'
                        setting={setting}
                        n={4}
                        onClickFunction={() => updateFeedLayout('compact')}
                    />
                </Grid>
            </Box>
        </Stack>
    );
};

const FeedLayoutPreviewCard = (props: FeedLayoutPreviewCardProps) => {
    const { feedLayout, heading, caption, setting, n, onClickFunction } = props;

    return (
        <Grid size={{ xs: 12, lg: 6 }} onClick={onClickFunction}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    border: '2px solid',
                    borderColor: setting.startupSetting.feedLayout === feedLayout ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 2,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4, borderColor: 'primary.light' },
                }}
            >
                <Box>
                    <SectionSubHeading text={heading} />
                    <SectionCaption text={caption} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: 120, mt: 2 }}>
                    {LayoutBars(n)}
                </Box>
            </Box>
        </Grid>
    );
};

const LayoutBars = (n?: number) => {
    const Bar = () => <Box sx={{ bgcolor: 'grey.200', height: '100%', borderRadius: 1 }} />

    if (!n) {
        return <Bar />;
    }

    return (
        <>
            {Array.from({ length: n }, (_, i) => (
                <Bar key={i} />
            ))}
        </>
    );
};


import Stack from '@mui/material/Stack';
// importing components
import { SectionSubHeading } from './ui/SettingTypography';

export const PrivacySetting = () => {
    return (
        <Stack spacing={3}>
            <SectionSubHeading text='Update `Allow people to follow you`' />
            <SectionSubHeading text='Update `Who can send you message`' />
            <SectionSubHeading text='Update `Blocked accounts`' />
            <SectionSubHeading text='Update `Clear history?`' />
        </Stack>
    );
};


import Stack from '@mui/material/Stack';
// importing components
import { SectionSubHeading } from './ui/SettingTypography';

export const ProfileSetting = () => {
    return (
        <Stack spacing={3}>
            {/* TODO: show a real-time profile change */}

            <SectionSubHeading text='Update Profile Photo' />
            <SectionSubHeading text='Update bio' />
            <SectionSubHeading text='Update socials' />
            <SectionSubHeading text='Update banner' />
            
            <SectionSubHeading text='Update `mark as mature (18+)`' />
            <SectionSubHeading text='Update `Show followers`' />
            <SectionSubHeading text='Update `Content and Activity`' />
        </Stack>
    );
};


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError } from '@syncspace/shared';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// importing icons
import ResetIcon from '@mui/icons-material/RestartAlt';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing features
import { cleanup } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
import type { ResetSettingButtonProps } from '../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useMobile } from '../../../hooks/useMobile';
import { useSettingModal } from '../hooks/useSettingModal';
import { useSettingSections } from '../hooks/useSettingSection';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { AccountSetting } from './AccountSetting';
import { KeyBindingsSettings } from './KeyBindingsSettings';
import { NotificationSetting } from './NotificationSetting';
import { PreferencesSetting } from './PreferencesSetting';
import { PrivacySetting } from './PrivacySetting';
import { ProfileSetting } from './ProfileSetting';

export const SettingModal = () => {
    const { settingsSidebarWidthPx, transitionDurationMs } = clientConfig;

    const dispatch = useDispatch<AppDispatch>();

    const updateSettingStatus = useSelector((state: RootState) => state.user.status.updateSetting);
    const updateSettingError = useSelector((state: RootState) => state.user.error.updateSetting);
    const resetSettingStatus = useSelector((state: RootState) => state.user.status.resetSetting);
    const resetSettingError = useSelector((state: RootState) => state.user.error.resetSetting);
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const showErrorSnackBar = useErrorSnackBar();
    const isMobile = useMobile();
    const { sections, activeSection, handleSectionChange } = useSettingSections();
    const { closeResetSettingModal } = useSettingModal();

    let filteredSections = sections;
    if (!isLoggedIn) {
        filteredSections = filteredSections.filter((section) => !section.authRequired);
    }

    useEffect(() => {
        if (updateSettingStatus === 'succeeded') {
            setTimeout(() => {
                dispatch(cleanup('updateSetting'));
            }, transitionDurationMs)
        }

        if (updateSettingStatus === 'failed' && updateSettingError) {
            showErrorSnackBar(new ApiError(updateSettingError));
            dispatch(cleanup('updateSetting'));
        }
    }, [updateSettingStatus, updateSettingError]);

    useEffect(() => {
        if (resetSettingStatus === 'succeeded') {
            closeResetSettingModal();
            setTimeout(() => {
                dispatch(cleanup('resetSetting'));
            }, transitionDurationMs)
        }

        if (resetSettingStatus === 'failed' && resetSettingError) {
            showErrorSnackBar(new ApiError(resetSettingError));
            dispatch(cleanup('resetSetting'));
        }
    }, [resetSettingStatus, resetSettingError]);

    return (
        <Box sx={{ height: '80vh', width: '70vw', maxWidth: '1080px' }}>
            <Typography variant='h5' sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                Settings
            </Typography>

            <Box sx={{ display: 'flex', height: 'calc(100% - 65px)', position: 'relative' }}>
                <Box
                    sx={{
                        height: '100%',
                        width: isMobile ? 72 : settingsSidebarWidthPx,
                        minWidth: isMobile ? 72 : settingsSidebarWidthPx,
                        overflow: 'auto',
                        position: 'relative',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'center',
                    }}
                >
                    <List component='nav' sx={{ p: 1 }}>
                        {filteredSections.map((section) => (
                            <ListItem key={section.id} disablePadding>
                                <ListItemButton
                                    selected={activeSection === section.id}
                                    onClick={() => handleSectionChange(section.id)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': { backgroundColor: 'action.selected' },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>{section.icon}</ListItemIcon>
                                    {!isMobile && <ListItemText primary={section.label} />}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <ResetSettingButton
                        startIcon={<ResetIcon />}
                        sx={{ display: { xs: 'none', md: 'flex' }, width: '93%' }}
                    >
                        Reset Settings
                    </ResetSettingButton>

                    <ResetSettingButton sx={{ display: { xs: 'block', md: 'none' }, width: '64px !important' }}>
                        <ResetIcon />
                    </ResetSettingButton>
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                    {activeSection === 'preferences' && <PreferencesSetting />}
                    {activeSection === 'profile' && <ProfileSetting />}
                    {activeSection === 'account' && <AccountSetting />}
                    {activeSection === 'notification' && <NotificationSetting />}
                    {activeSection === 'privacy' && <PrivacySetting />}
                    {activeSection === 'keybindings' && <KeyBindingsSettings />}
                </Box>

                {(updateSettingStatus === 'loading' || updateSettingStatus === 'succeeded') &&
                    <CenteredBox sx={{ gap: 0.75, position: 'absolute', bottom: '12px', right: '24px', color: 'text.secondary' }}>
                        {updateSettingStatus === 'loading' && <CircularProgress size='16px' color='inherit' />}
                        <Typography variant='caption' sx={{ fontSize: '14px' }}>
                            {updateSettingStatus === 'succeeded' && 'Saved'}
                            {updateSettingStatus === 'loading' && 'Saving...'}
                        </Typography>
                    </CenteredBox>
                }
            </Box>
        </Box>
    );
};

const ResetSettingButton = (props: ResetSettingButtonProps) => {
    const { children, sx, ...rest } = props;

    const { openResetSettingModal } = useSettingModal();

    return (
        <Button
            variant='contained'
            onClick={openResetSettingModal}
            sx={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                py: 1,
                ...sx
            }}
            {...rest}
        >
            {children}
        </Button >
    );
};


import { useMemo, useReducer, useRef, useState } from 'react';
import { ApiError, ApiResponse, validateAll, validateCurrentPassword, validateNewPassword } from '@syncspace/shared';
// importing features
import { reauthCallbackRegistry } from '../../reauth';
// importing types
import type { FormEvent } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { ApiCallStatus, FormState } from '../../../types';
import type { ChangePasswordField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing contexts
import { useSnackBarContext } from '../../../contexts/snackbar.context';
// importing services
import {
    changePassword as changePasswordService,
} from '../services/api.service';

export const useChangePassword = () => {
    const { openSnackBar } = useSnackBarContext();

    const [changePasswordStatus, setChangePasswordStatus] = useState<ApiCallStatus>('idle');

    const initialFormState: FormState<ChangePasswordField> = createInitialFormState(['currentPassword', 'newPassword']);
    const [formData, formDispatch] = useReducer(formReducer<ChangePasswordField>, initialFormState);
    const { currentPassword, newPassword } = formData;
    const onChange = useMemo(() => handleFormDataChange<ChangePasswordField>(formDispatch), []);

    const currentPasswordRef = useRef<HTMLInputElement | null>(null);
    const newPasswordRef = useRef<HTMLInputElement | null>(null);
    const refs = { currentPasswordRef, newPasswordRef };

    const changePasswordErrorHandler = createErrorHandler<ChangePasswordField>(formDispatch, [currentPasswordRef, newPasswordRef]);

    const [showPassword, setShowPassword] = useState({ currentPassword: false, newPassword: false });

    const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (changePasswordStatus === 'loading') {
                return;
            }

            setChangePasswordStatus('loading');

            const credentialsValidity = validateAll(validateCurrentPassword(currentPassword.value), validateNewPassword(newPassword.value));
            if (credentialsValidity !== true) {
                throw credentialsValidity;
            }

            if (currentPassword.value === newPassword.value) {
                throw {
                    index: 1,
                    src: 'newPassword',
                    message: `New password can't be the same as current password`,
                } as IndexedValidationError;
            }

            const body = {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value,
            };

            const onSuccess = () => {
                formDispatch({ type: 'RESET_FORM' });
                setChangePasswordStatus('succeeded');
                openSnackBar({ status: 'success', message: 'Password changed successfully..' });
            };

            const onError = (error: ApiError) => {
                setChangePasswordStatus('failed');
                openSnackBar({ status: 'error', message: error.message });
            };

            const callbackId = crypto.randomUUID();
            const response = await changePasswordService(body, callbackId);
            if (response instanceof ApiError) {
                reauthCallbackRegistry.set(callbackId, { onSuccess, onError });
                onError(response);
            } else if (response instanceof ApiResponse) {
                onSuccess();
            }
        } catch (error) {
            setChangePasswordStatus('failed');
            changePasswordErrorHandler(error);
        }
    };

    return {
        formData,
        formDispatch,
        onChange,
        refs,
        showPassword,
        setShowPassword,
        handleChangePassword,
    };
};


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError } from '@syncspace/shared';
// importing features
import { cleanup } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useSettingModal } from './useSettingModal';

export const useDeleteAccount = () => {
    const dispatch = useDispatch<AppDispatch>();

    const showErrorSnackBar = useErrorSnackBar();

    const deleteAccountStatus = useSelector((state: RootState) => state.user.status.deleteAccount);
    const deleteAccountError = useSelector((state: RootState) => state.user.error.deleteAccount);

    const { closeDeleteAccountModal, closeSettingModal } = useSettingModal();

    useEffect(() => {
        if (deleteAccountStatus === 'succeeded') {
            closeDeleteAccountModal();
            closeSettingModal();
            dispatch(cleanup('deleteAccount'));
        }

        if (deleteAccountStatus === 'failed' && deleteAccountError) {
            showErrorSnackBar(new ApiError(deleteAccountError));
            dispatch(cleanup('deleteAccount'));
        }
    }, [deleteAccountStatus, deleteAccountError]);
};


import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError } from '@syncspace/shared';
// importing features
import { cleanup } from '../../user';
// importing types
import type { AppDispatch, RootState } from '../../../types';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';

export const useDetermineReauth = () => {
    const dispatch = useDispatch<AppDispatch>();

    const showErrorSnackBar = useErrorSnackBar();

    const determineReauthStatus = useSelector((state: RootState) => state.user.status.determineReauth);
    const determineReauthError = useSelector((state: RootState) => state.user.error.determineReauth);

    useEffect(() => {
        if (determineReauthStatus === 'failed' && determineReauthError) {
            showErrorSnackBar(new ApiError(determineReauthError));
            dispatch(cleanup('determineReauth'));
        }
    }, [determineReauthStatus, determineReauthError]);

    return {
        determineReauthStatus,
    };
};


import { useDispatch } from 'react-redux';
// importing features
import { deleteAccount, resetSetting } from '../../user';
// importing types
import type { AppDispatch } from '../../../types';
// importing contexts
import { useModalContext } from '../../../contexts/modal.context';
// importing components
import { SettingModal } from '../components/SettingModal';

export const useSettingModal = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { openModal, closeModal } = useModalContext();

    const openSettingModal = () => {
        openModal({
            id: 'setting',
            hideTitle: true,
            modalContent: {
                body: <SettingModal />
            },
            closeButton: { top: '16px', right: '16px' },
            unstyled: true,
        });
    };

    const closeSettingModal = () => {
        closeModal('setting');
    };

    const openResetSettingModal = () => {
        openModal({
            id: 'resetSetting',
            isPersistent: true,
            modalContent: {
                title: 'Reset Settings',
                body:
                    <>
                        Are you sure you want to reset all settings to their default values?
                        <br /><br />
                        This action cannot be undone.
                    </>
            },
            modalButtons: [
                {
                    label: 'Cancel',
                    variant: 'outlined',
                    autoFocus: true,
                    onClickFunction: () => { return true; },
                },
                {
                    label: 'Reset',
                    color: 'primary',
                    variant: 'contained',
                    onClickFunction: () => {
                        dispatch(resetSetting());
                        return false;
                    },
                },
            ],
            maxWidth: 'sm'
        });
    };

    const closeResetSettingModal = () => {
        closeModal('resetSetting');
    };

    const openDeleteAccountModal = () => {
        openModal({
            id: 'deleteAccount',
            isPersistent: true,
            modalContent: {
                title: 'Delete Account',
                body:
                    <>
                        This action is irreversible. Once deleted, you will not be able to create a new profile with the same name (i.e., e/me). If you intend to delete this profile only to recreate it, please consider using the 'Edit Profile' option instead.
                        <br /><br />
                        Are you sure you want to proceed?,
                    </>
            },
            modalButtons: [
                {
                    label: 'Cancel',
                    variant: 'outlined',
                    autoFocus: true,
                    onClickFunction: () => { return true; },
                },
                {
                    label: 'Delete',
                    color: 'error',
                    variant: 'contained',
                    onClickFunction: () => {
                        dispatch(deleteAccount());
                        return false;
                    },
                },
            ],
            maxWidth: 'sm'
        });
    };

    const closeDeleteAccountModal = () => {
        closeModal('deleteAccount');
    };

    return {
        openSettingModal,
        closeSettingModal,
        openDeleteAccountModal,
        closeDeleteAccountModal,
        openResetSettingModal,
        closeResetSettingModal,
    };
};


import { useState } from 'react';
// importing icons
import AccountSettingIcon from '@mui/icons-material/Person';
import KeyBindingSettingsIcon from '@mui/icons-material/Keyboard';
import NotificationSettingIcon from '@mui/icons-material/Notifications';
import PreferencesSettingIcon from '@mui/icons-material/Palette';
import PrivacySettingIcon from '@mui/icons-material/Shield';
import ProfileSettingIcon from '@mui/icons-material/AccountCircle';

export const useSettingSections = () => {
    const sections = [
        {
            id: 'preferences',
            label: 'Preferences',
            icon: <PreferencesSettingIcon />
        },
        {
            id: 'profile',
            authRequired: true,
            label: 'Profile',
            icon: <ProfileSettingIcon />
        },
        {
            id: 'account',
            authRequired: true,
            label: 'Account',
            icon: <AccountSettingIcon />
        },
        {
            id: 'notifications',
            authRequired: true,
            label: 'Notifications',
            icon: <NotificationSettingIcon />
        },
        {
            id: 'privacy',
            authRequired: true,
            label: 'Privacy',
            icon: <PrivacySettingIcon />
        },
        {
            id: 'keybindings',
            label: 'Keyboard Shortcuts',
            icon: <KeyBindingSettingsIcon />
        },
    ];

    const [activeSection, setActiveSection] = useState('preferences');

    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    return { sections, activeSection, handleSectionChange };
};


import { useEffect, useMemo, useReducer, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, validateAll, validateEmail } from '@syncspace/shared';
// importing features
import { cleanup, updateEmail } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { AppDispatch, FormState, RootState } from '../../../types';
import type { UpdateEmailField } from '../types';
// importing reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';

export const useUpdateEmail = () => {
    const showErrorSnackBar = useErrorSnackBar();

    const dispatch = useDispatch<AppDispatch>();

    const updateEmailStatus = useSelector((state: RootState) => state.user.status.updateEmail);
    const updateEmailError = useSelector((state: RootState) => state.user.error.updateEmail);

    const initialFormState: FormState<UpdateEmailField> = createInitialFormState(['email']);
    const [formData, formDispatch] = useReducer(formReducer<UpdateEmailField>, initialFormState);
    const { email } = formData;
    const onChange = useMemo(() => handleFormDataChange<UpdateEmailField>(formDispatch), []);

    const emailRef = useRef<HTMLInputElement | null>(null);

    const updateEmailErrorHandler = createErrorHandler<UpdateEmailField>(formDispatch, [emailRef]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (updateEmailStatus === 'loading') {
                return;
            }


            const emailValidity = validateAll(validateEmail(email.value));
            if (emailValidity !== true) {
                throw emailValidity;
            }

            dispatch(updateEmail({ newEmail: email.value }));
        } catch (error) {
            updateEmailErrorHandler(error);
        }
    };

    useEffect(() => {
        if (updateEmailStatus === 'succeeded') {
            dispatch(cleanup('updateEmail'));
        }

        if (updateEmailStatus === 'failed' && updateEmailError) {
            showErrorSnackBar(new ApiError(updateEmailError));
            dispatch(cleanup('deleteAccount'));
        }
    }, [updateEmailStatus, updateEmailError]);

    return {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
    };
};


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, ApiResponse } from '@syncspace/shared';
// importing features
import { cleanup } from '../../user';
// importing types
import type { ApiCallStatus, AppDispatch, RootState } from '../../../types';
// importing contexts
import { useSnackBarContext } from '../../../contexts/snackbar.context';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
// importing services
import {
    initiateEmailVerification as initiateEmailVerificationService,
} from '../services/api.service';
import { reauthCallbackRegistry } from '../../reauth';

export const useVerifyEmail = () => {
    const { openSnackBar } = useSnackBarContext();

    const dispatch = useDispatch<AppDispatch>();

    const showErrorSnackBar = useErrorSnackBar();

    const [initiateEmailVerificationStatus, setInitiateEmailVerification] = useState<ApiCallStatus>('idle');

    const verifyEmailStatus = useSelector((state: RootState) => state.user.status.verifyEmail);
    const verifyEmailError = useSelector((state: RootState) => state.user.error.verifyEmail);

    const initiateEmailVerification = async () => {
        try {
            if (initiateEmailVerificationStatus === 'loading') {
                return;
            }

            setInitiateEmailVerification('loading');

            const onSuccess = () => {
                setInitiateEmailVerification('succeeded');
                openSnackBar({ status: 'success', message: 'Verification mail sent' });
            };

            const onError = (error: ApiError) => {
                setInitiateEmailVerification('failed');
                openSnackBar({ status: 'error', message: error.message });
            };

            const callbackId = crypto.randomUUID();
            const response = await initiateEmailVerificationService(callbackId);
            if (response instanceof ApiError) {
                reauthCallbackRegistry.set(callbackId, { onSuccess, onError });
                onError(response);
            } else if (response instanceof ApiResponse) {
                onSuccess();
            }
        } catch (error) {
            setInitiateEmailVerification('failed');
        }
    };

    useEffect(() => {
        if (verifyEmailStatus === 'succeeded') {
            dispatch(cleanup('verifyEmail'));
        }

        if (verifyEmailStatus === 'failed' && verifyEmailError) {
            showErrorSnackBar(new ApiError(verifyEmailError));
            dispatch(cleanup('verifyEmail'));
        }
    }, [verifyEmailStatus, verifyEmailError]);

    return {
        initiateEmailVerification,
    };
};


// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type { UpdatePasswordParams } from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

export const initiateEmailVerification = (
    callbackId?: string,
) => apiHandler(() => API.post('/user/initiateEmailVerification'),{
    reauthService: 'changePassword',
    callbackId,
});

export const changePassword = (
    body: UpdatePasswordParams,
    callbackId?: string,
) => apiHandler(() => API.patch('/user/changePassword', body), {
    reauthService: 'changePassword',
    args: body,
    callbackId,
});


export type HotkeyDisplayProps = {
    text: string,
    binding: string,
    last?: boolean,
    info?: string,
};


// importing types
import type { SwitchProps } from '@mui/material';

export type SettingCheckBoxProps = {
    label: string,
    name: string,
    description?: string,
    disabled?: boolean,
} & SwitchProps;


// importing types
import type { TypographyProps } from '@mui/material';

export type SectionHeadingProps = {
    text: string,
} & TypographyProps;

export type SectionSubHeadingProps = SectionHeadingProps;

export type SectionCaptionProps = SectionHeadingProps;


// importing types
import type { PaletteOptions } from '@mui/material';

export type ThemePreviewCardProps = {
    label: string,
    selected: boolean,
    theme: PaletteOptions | undefined,
    onSelect: () => void,
};


// importing types
import type { FeedLayout, SettingSchema } from '@syncspace/shared';

export type FeedLayoutPreviewCardProps = {
    feedLayout: FeedLayout,
    heading: string,
    caption: string,
    setting: SettingSchema,
    n: number,
    onClickFunction: () => void,
};


// importing types
import type { ReactNode } from 'react';
import type { ButtonProps } from '@mui/material';

export type ResetSettingButtonProps = {
    children: ReactNode,
    sx?: object,
} & ButtonProps;


export type ChangePasswordField = 'currentPassword' | 'newPassword';


// TODO: try newEmail
// if works then validateNewPassword and validateCurrentPassword will no longer be needed
export type UpdateEmailField = 'email';


export type UpdatePasswordParams = {
    currentPassword: string,
    newPassword: string,
};


export * from './components/ui/HotkeyDisplay.type';
export * from './components/ui/SettingCheckBox.type';
export * from './components/ui/SettingTypography.type';
export * from './components/ui/ThemePreviewCard.type';
export * from './components/PreferencesSetting.type';
export * from './components/SettingModal.type';

export * from './hooks/useChangePassword.type';
export * from './hooks/useUpdateEmail.type';

export * from './services/api.service.type';


// exporting hooks
export { useSettingModal } from './hooks/useSettingModal';
// exporting services
export * from './services/api.service';


import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
// importing reducers
import { clearSocket, setSocketId } from "../reducers/socket.reducer";
// importing utils
import { logError, logMessage } from "../../../utils/log.util";

export const useSocket = () => {
    const dispatch = useDispatch();

    const [connected, setConnected] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                transports: ["websocket", "polling"],
            });
        }

        const socket = socketRef.current;

        const onConnect = () => {
            if (socket.id) {
                logMessage("Socket connected with ID:", socket.id);
                dispatch(setSocketId(socket.id));
                setConnected(true);
            }
        };

        const onDisconnect = () => {
            logMessage("Socket disconnected");
            setConnected(false);
            dispatch(clearSocket());
        };

        const onError = (error: Error) => {
            logError("Socket error:", error);
            setConnected(false);
            dispatch(clearSocket());
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onError);
            socket.disconnect();
        };
    }, []);

    return {
        socket: socketRef.current,
        connected,
    };
};


import { createSlice } from '@reduxjs/toolkit';
// importing types
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SocketSlice } from '../types';

const initialSocketState: SocketSlice = {
    connected: false,
};

const socketSlice = createSlice({
    name: 'socket',
    initialState: initialSocketState,
    reducers: {
        setSocketId(state, action: PayloadAction<string>) {
            state.socketId = action.payload;
            state.connected = true;
        },
        clearSocket(state) {
            state.socketId = undefined;
            state.connected = false;
        },
    },
});

export const {
    setSocketId,
    clearSocket,
} = socketSlice.actions;
export const socketReducer = socketSlice.reducer;


export type SocketSlice = {
    socketId?: string,
    connected: boolean,
};


export * from './reducers/socket.reducer.type';


// exporting reducers
export * from './reducers/socket.reducer';
// exporting hooks
export * from './hooks/useSocket';


// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import { deleteAccount, resetSetting, updateSetting } from './account.user.thunk';
// importing utils
import {
    loadUserWithSettings,
    persistSetting,
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const accountExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // TODO: implement queue system for update requests
        // updateSetting
        .addCase(updateSetting.pending, (state) => {
            setUserLoading('updateSetting', state);
        })
        .addCase(updateSetting.fulfilled, (state, action) => {
            state.user.setting = action.payload;
            state.prevSetting = state.user.setting;
            persistSetting(state.user.setting);

            setUserSuccess('updateSetting', state);
        })
        .addCase(updateSetting.rejected, (state, action) => {
            if (state.prevSetting) {
                state.user.setting = state.prevSetting;
                persistSetting(state.user.setting);
            }

            setUserError('updateSetting', state, action);
        })
        // resetSetting
        .addCase(resetSetting.pending, (state) => {
            setUserLoading('resetSetting', state);
        })
        .addCase(resetSetting.fulfilled, (state, action) => {
            state.user.setting = action.payload;
            state.prevSetting = state.user.setting;
            persistSetting(state.user.setting);

            setUserSuccess('resetSetting', state);
        })
        .addCase(resetSetting.rejected, (state, action) => {
            if (state.prevSetting) {
                state.user.setting = state.prevSetting;
                persistSetting(state.user.setting);
            }

            setUserError('resetSetting', state, action);
        })
        // deleteAccount
        .addCase(deleteAccount.pending, (state) => {
            setUserLoading('deleteAccount', state);
        })
        .addCase(deleteAccount.fulfilled, (state) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            state.prevSetting = state.user.setting;

            persistSetting(state.user.setting);
            setUserSuccess('deleteAccount', state);
        })
        .addCase(deleteAccount.rejected, (state, action) => {
            setUserError('deleteAccount', state, action);
        })
};

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError, defaultSetting } from '@syncspace/shared';
// importing types
import type { SettingSchema } from '@syncspace/shared';
import type { UpdateSettingParams } from '../../types';
import type { RootState } from '../../../../types';
// importing services
import {
    deleteAccount as deleteAccountService,
    resetSetting as resetSettingService,
    updateSetting as updateSettingService,
} from '../../services/api.service';
import { handleUserResponse } from '../../utils/userSlice.utils';

export const updateSetting = createAsyncThunk<
    SettingSchema,
    UpdateSettingParams,
    { state: RootState, rejectValue: ApiError }
>('account/updateSetting', async (body, { getState, rejectWithValue }) => {
    const { isLoggedIn } = getState().user;

    if (!isLoggedIn) {
        return body.newSetting;
    }

    const response = await updateSettingService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const resetSetting = createAsyncThunk<
    SettingSchema,
    void,
    { state: RootState, rejectValue: ApiError }
>('account/resetSetting', async (_, { getState, rejectWithValue }) => {
    const { isLoggedIn } = getState().user;

    if (!isLoggedIn) {
        return defaultSetting;
    }

    const response = await resetSettingService();
    return handleUserResponse(response, rejectWithValue);
});

export const deleteAccount = createAsyncThunk<
    void,
    void,
    { rejectValue: ApiError }
>('account/deleteAccount', async (_, { rejectWithValue }) => {
    const response = await deleteAccountService();
    return handleUserResponse(response, rejectWithValue);
});


// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import { login, logout, reauth, register, resetPassword } from './auth.user.thunk';
// importing utils
import {
    handleLogin,
    handleLogout,
    loadUserWithSettings,
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const authExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // register
        .addCase(register.pending, (state) => {
            setUserLoading('register', state);
        })
        .addCase(register.fulfilled, (state, action) => {
            handleLogin(state, action);
            setUserSuccess('register', state);
        })
        .addCase(register.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            setUserError('register', state, action);
        })
        // login
        .addCase(login.pending, (state) => {
            setUserLoading('login', state);
        })
        .addCase(login.fulfilled, (state, action) => {
            handleLogin(state, action);
            setUserSuccess('login', state);
        })
        .addCase(login.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            setUserError('login', state, action);
        })
        // resetPassword
        .addCase(resetPassword.pending, (state) => {
            setUserLoading('resetPassword', state);
        })
        .addCase(resetPassword.fulfilled, (state, action) => {
            handleLogin(state, action);
            setUserSuccess('resetPassword', state);
        })
        .addCase(resetPassword.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            setUserError('resetPassword', state, action);
        })
        // reauth
        .addCase(reauth.pending, (state) => {
            setUserLoading('reauth', state);
        })
        .addCase(reauth.fulfilled, (state, action) => {
            state.accessToken = action.payload.accessToken;
            setUserSuccess('reauth', state);
        })
        .addCase(reauth.rejected, (state, action) => {
            setUserError('reauth', state, action);
        })
        // logout
        .addCase(logout.pending, (state) => {
            setUserLoading('logout', state);
        })
        .addCase(logout.fulfilled, (state) => {
            handleLogout(state);
            setUserSuccess('logout', state);
        })
        .addCase(logout.rejected, (state, action) => {
            setUserError('logout', state, action);
        })
};


import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError } from '@syncspace/shared';
// importing types
import type { UserClientBase } from '@syncspace/shared';
import type {
    LoginParams,
    ReauthParams,
    RegisterParams,
    ResetPasswordParams,
    SessionInitReturnType,
} from '../../types';
// importing services
import {
    login as loginService,
    logout as logoutService,
    reauth as reauthService,
    register as registerService,
    resetPassword as resetPasswordService,
} from '../../services/api.service';
// importing utils
import { handleUserResponse } from '../../utils/userSlice.utils';

export const register = createAsyncThunk<
    SessionInitReturnType,
    RegisterParams,
    { rejectValue: ApiError }
>('auth/register', async (body, { rejectWithValue }) => {
    const response = await registerService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const login = createAsyncThunk<
    SessionInitReturnType,
    LoginParams,
    { rejectValue: ApiError }
>('auth/login', async (body, { rejectWithValue }) => {
    const response = await loginService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const resetPassword = createAsyncThunk<
    SessionInitReturnType,
    ResetPasswordParams,
    { rejectValue: ApiError }
>('auth/resetPassword', async (body, { rejectWithValue }) => {
    const response = await resetPasswordService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const reauth = createAsyncThunk<
    { accessToken: string },
    ReauthParams,
    { rejectValue: ApiError }
>('auth/reauth', async (body, { rejectWithValue }) => {
    const response = await reauthService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const logout = createAsyncThunk<
    UserClientBase,
    void,
    { rejectValue: ApiError }
>('auth/logout', async (_, { rejectWithValue }) => {
    const response = await logoutService();
    return handleUserResponse(response, rejectWithValue);
});


// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import { updateEmail } from './profile.user.thunk';
// importing utils
import {
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const profileExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // updateEmail
        .addCase(updateEmail.pending, (state) => {
            setUserLoading('updateEmail', state);
        })
        .addCase(updateEmail.fulfilled, (state, action) => {
            state.user = action.payload;
            setUserSuccess('updateEmail', state);
        })
        .addCase(updateEmail.rejected, (state, action) => {
            setUserError('updateEmail', state, action);
        })
        // verifyEmail
        // in case of verifyEmail their will be 2 routes:
        // 1. initiate verification -> send mail to user.email with link to verify mail [Not redux based]
        // 2. actual verify email -> when clicked on link set isVerified true [redux based]
        // doubt? what to do then? after seting isVerified in backend what to send to client?
        // cuz their are 2 cases ->
        // case 1: (ideal case) the window from which the user initiated the verification process; 
        // if the user is opening the verification link (from mail) in the same window then 
        // I can just set state.user and the ui will reflect that email has been verified
        // case 2: (realistic case) if the window from which the user initiated the verification process 
        // is different from the one in which the user is opening the verification link (from mail), like their phone 
        // then i can't just set state.user; cuz that would mean that i am sending user info in a device prematurely 
        // thus i should not send user info after verification; but then 
        // the initial window (from which the user initiated the verification process) wouldn't update the UI
        // What i want is to update the UI after verification link from email has been clicked and 
        // without sending the entire user info trigger a ui update in the initial window
};


import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError } from '@syncspace/shared';
// importing types
import type { UserClientBase } from '@syncspace/shared';
import type { UpdateEmailParams } from '../../types';
// importing services
import {
    updateEmail as updateEmailService,
    verifyEmail as verifyEmailService,
} from '../../services/api.service';
// importing utils
import { handleUserResponse } from '../../utils/userSlice.utils';

export const updateEmail = createAsyncThunk<
    UserClientBase,
    UpdateEmailParams,
    { rejectValue: ApiError }
>('profile/updateEmail', async (body, { rejectWithValue }) => {
    const response = await updateEmailService(body);
    return handleUserResponse(response, rejectWithValue);
});

export const verifyEmail = createAsyncThunk<
    void,
    void,
    { rejectValue: ApiError }
>('profile/verifyEmail', async (_, { rejectWithValue }) => {
    const response = await verifyEmailService();
    return handleUserResponse(response, rejectWithValue);
});


// importing types
import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import type { UserSlice } from '../../types';
// importing thunks
import {
    determineReauth,
    fetchSession,
} from './session.user.thunk';
// importing utils
import {
    loadUserWithSettings,
    persistSetting,
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

export const sessionExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    builder
        // fetchSession
        .addCase(fetchSession.pending, (state) => {
            setUserLoading('fetchSession', state);
        })
        .addCase(fetchSession.fulfilled, (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = true;
            state.prevSetting = state.user.setting;

            persistSetting(state.user.setting);
            setUserSuccess('fetchSession', state);
        })
        .addCase(fetchSession.rejected, (state, action) => {
            state.user = loadUserWithSettings();
            state.isLoggedIn = false;
            state.prevSetting = null;
            setUserError('fetchSession', state, action);
        })
        // determineReauth
        .addCase(determineReauth.pending, (state) => {
            setUserLoading('determineReauth', state);
        })
        .addCase(determineReauth.fulfilled, (state, action) => {
            state.needsReauth = action.payload;
            setUserSuccess('determineReauth', state);
        })
        .addCase(determineReauth.rejected, (state, action) => {
            setUserError('determineReauth', state, action);
        })
};


import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError, defaultError } from '@syncspace/shared';
// importing app
import { store } from '../../../../app/store';
// importing types
import type { UserClientBase } from '@syncspace/shared';
// importing libs
import { API } from '../../../../libs/axios.lib';
// importing reducers
import { setAccessToken } from '../../reducers/user.reducer';
// importing services
import {
    determineReauth as determineReauthService,
    fetchSession as fetchSessionService,
} from '../../services/api.service';
// importing utils
import { handleUserResponse } from '../../utils/userSlice.utils';

export const fetchSession = createAsyncThunk<
    UserClientBase,
    void,
    { rejectValue: ApiError }
>('session/fetchSession', async (_, { rejectWithValue }) => {
    try {
        const refreshRes = await API.post('/auth/refresh');
        if (refreshRes instanceof ApiError) {
            throw refreshRes;
        }

        const accessToken = refreshRes.data.accessToken;
        store.dispatch(setAccessToken(accessToken));

        const sessionRes = await fetchSessionService();
        if (sessionRes instanceof ApiError) {
            throw sessionRes;
        }

        return sessionRes.data;
    } catch (error) {
        const finalError = error instanceof ApiError ?
            error :
            new ApiError({ ...defaultError, trace: 'fetchSession/noResponseData' });

        return rejectWithValue({ ...finalError });
    }
});

export const determineReauth = createAsyncThunk<
    boolean,
    void,
    { rejectValue: ApiError }
>('session/determineReauth', async (_, { rejectWithValue }) => {
    const response = await determineReauthService();
    return handleUserResponse(response, rejectWithValue);
});


import { createSlice } from '@reduxjs/toolkit';
// importing features
import { accountExtraReducers } from '../features/account/account.user.reducer';
import { authExtraReducers } from '../features/auth/auth.user.reducer';
import { profileExtraReducers } from '../features/profile/profile.user.reducer';
import { sessionExtraReducers } from '../features/session/session.user.reducer';
// importing types
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SettingSchema } from '@syncspace/shared';
import type { ApiCallStatus } from '../../../types';
import type { RetryMeta, UserService, UserSlice } from '../types';
// importing utils
import { handleLogout, loadUserWithSettings } from '../utils/userSlice.utils';

const initialUserState: UserSlice = {
    user: loadUserWithSettings(),
    isLoggedIn: false,
    status: {} as Record<UserService, ApiCallStatus>,
    error: {} as Record<UserService, null>,
    prevSetting: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        cleanup: (state, action: PayloadAction<UserService>) => {
            state.status[action.payload] = 'idle';
            state.error[action.payload] = null;
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        promptReauth: (state, action: PayloadAction<RetryMeta>) => {
            state.reauthMeta = {
                active: true,
                retryMeta: action.payload,
            };
        },
        closeReauth: (state) => {
            state.reauthMeta = undefined;
        },
        optimisticUpdateSetting: (state, action: PayloadAction<SettingSchema>) => {
            state.prevSetting = state.user.setting;
            state.user.setting = action.payload;
        },
        logUserOut: (state) => {
            handleLogout(state);
        },
    },
    extraReducers: (builder) => {
        builder:
        accountExtraReducers(builder);
        authExtraReducers(builder);
        profileExtraReducers(builder);
        sessionExtraReducers(builder);
    },
});

export const {
    cleanup,
    setAccessToken,
    promptReauth,
    closeReauth,
    optimisticUpdateSetting,
    logUserOut,
} = userSlice.actions;
export const userReducer = userSlice.reducer;


// importing lib
import { API } from '../../../libs/axios.lib';
// importing types
import type {
    LoginParams,
    LoginViaFacebookParams,
    LoginViaGoogleParams,
    ReauthParams,
    RegisterParams,
    RegisterViaFacebookParams,
    RegisterViaGoogleParams,
    ResetPasswordParams,
    UpdateEmailParams,
    UpdateSettingParams,
} from '../types';
// importing services
import { apiHandler } from '../../../services/api.service';

// auth services
export const register = (
    body: RegisterParams,
) => apiHandler(() => API.post('/auth/register', body, {
    headers: { 'Content-Type': 'multipart/form-data' }
}));

export const login = (
    body: LoginParams,
) => apiHandler(() => API.post('/auth/login', body));

export const registerViaGoogle = (
    body: RegisterViaGoogleParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const loginViaGoogle = (
    body: LoginViaGoogleParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const registerViaFacebook = (
    body: RegisterViaFacebookParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const loginViaFacebook = (
    body: LoginViaFacebookParams,
) => apiHandler(() => API.post('/auth/registerViaGoogle', body));

export const resetPassword = (
    body: ResetPasswordParams,
) => apiHandler(() => API.patch('/auth/resetPassword', body));

export const reauth = (
    body: ReauthParams,
) => apiHandler(() => API.post('/auth/reauth', body));

export const logout = (
) => apiHandler(() => API.delete('/auth/logout'));

// profile services
export const verifyEmail = (
) => apiHandler(() => API.patch('/user/verifyEmail'));

export const updateEmail = (
    body: UpdateEmailParams,
) => apiHandler(() => API.patch('/user/updateEmail', body), {
    reauthService: 'updateEmail',
});

// account services
export const updateSetting = (
    body: UpdateSettingParams,
) => apiHandler(() => API.patch('/user/updateSetting', body));

export const resetSetting = (
) => apiHandler(() => API.patch('/user/resetSetting'));

export const deleteAccount = (
) => apiHandler(() => API.delete('/user/deleteAccount'), {
    reauthService: 'deleteAccount',
});

// session services
export const fetchSession = (
) => apiHandler(() => API.get('/user/fetchSession'));

export const determineReauth = (
) => apiHandler(() => API.get('/user/determineReauth'), {
    reauthService: 'determineReauth',
});


// importing types
import type { ApiError, SettingSchema, UserClientBase } from '@syncspace/shared';
import type { ApiCallStatus } from '../../../../types';

export type UserSlice = {
    user: UserClientBase,
    isLoggedIn: boolean,
    status: Record<UserService, ApiCallStatus>,
    error: Record<UserService, ApiError | null>,
    prevSetting: SettingSchema | null,
    accessToken?: string,
    reauthMeta?: {
        active: boolean,
        retryMeta: RetryMeta,
    },
    needsReauth?: boolean,
};

export type UserReauthCallbackService = 'changePassword';

export type UserReauthThunkService =
    'determineReauth' |
    'deleteAccount' |
    'updateEmail';

// all services that require reauthentication
export type UserReauthService = UserReauthCallbackService | UserReauthThunkService;

// all services that require a valid access token
export type UserRefreshService =
    'fetchSession' |
    'reauth' |
    'updateSetting' |
    'resetSetting' |
    'logout' |
    'verifyEmail' |
    UserReauthService;

// all services 
export type UserService =
    'register' |
    'login' |
    'resetPassword' |
    'refresh' |
    UserRefreshService;

export type RetryMeta = {
    reauthService: UserReauthService,
    args?: any,
    callbackId?: string,
};


// importing types
import type { SettingSchema, UserClientBase } from '@syncspace/shared';

export type SessionInitReturnType = {
    user: UserClientBase,
    accessToken: string,
};

export type LoginParams = {
    email: string,
    password: string,
};

export type RegisterParams = LoginParams & {
    username: string,
    profilePic?: File | null,
    startupSettingStr: string,
};

export type RegisterViaGoogleParams = {};
export type LoginViaGoogleParams = {};
export type RegisterViaFacebookParams = {};
export type LoginViaFacebookParams = {};

export type ResetPasswordParams = {
    resetPasswordToken: string,
    newPassword: string,
};

export type ReauthParams = {
    password: string,
};

export type UpdateEmailParams = {
    newEmail: string,
};

export type UpdateSettingParams = {
    newSetting: SettingSchema;
};


export * from './reducers/user.reducer.type';

export * from './services/api.service.type';


// importing features
import { changePassword } from "../../setting";
// importing types
import type { AppDispatch } from "../../../types";
import type { UserReauthService } from "../types";
// importing thunks
import { deleteAccount } from "../features/account/account.user.thunk";
import { updateEmail } from "../features/profile/profile.user.thunk";
import { determineReauth } from "../features/session/session.user.thunk";

export const retryRegistry = {
    changePassword: (args) => changePassword(args),
    deleteAccount: (args, dispatch) => dispatch(deleteAccount(args)),
    determineReauth: (args, dispatch) => dispatch(determineReauth(args)),
    updateEmail: (args, dispatch) => dispatch(updateEmail(args)),
} as Record<UserReauthService, (args: any, dispatch: AppDispatch) => Promise<any>>;


import { ApiError, ApiResponse, defaultStartupSetting, emptyUser } from '@syncspace/shared';
// importing data
import { clientConfig } from '../../../data/constants.data';
// importing types
import type { PayloadAction, WritableDraft } from '@reduxjs/toolkit';
import type { SettingSchema } from '@syncspace/shared';
import type { SessionInitReturnType, UserService, UserSlice } from '../types';

const defaultSetting: SettingSchema = {
    startupSetting: defaultStartupSetting,
};

export const loadUserWithSettings = () => {
    const { localStorageKey } = clientConfig;

    const savedStartupSetting = localStorage.getItem(localStorageKey);

    if (savedStartupSetting) {
        try {
            return {
                ...emptyUser,
                setting: { startupSetting: JSON.parse(savedStartupSetting) },
            };
        } catch {
            return { ...emptyUser, setting: defaultSetting };
        }
    }

    return { ...emptyUser, setting: defaultSetting };
};

export const persistSetting = (setting: SettingSchema) => {
    const { localStorageKey } = clientConfig;

    localStorage.setItem(
        localStorageKey,
        JSON.stringify(setting.startupSetting)
    );
};

export const handleLogin = (state: WritableDraft<UserSlice>, action: PayloadAction<SessionInitReturnType>) => {
    state.user = action.payload.user;
    state.accessToken = action.payload.accessToken;
    state.isLoggedIn = true;
    state.prevSetting = state.user.setting;

    persistSetting(state.user.setting);
};

export const handleLogout = (state: WritableDraft<UserSlice>) => {
    const prevUser = state.user;

    state.user = {
        ...emptyUser,
        setting: { startupSetting: prevUser.setting.startupSetting }
    };

    state.isLoggedIn = false;
    state.prevSetting = state.user.setting;
    persistSetting(state.user.setting);
};

export const handleUserResponse = (response: ApiResponse | ApiError, rejectWithValue: (value: ApiError) => unknown) => {
    if (response instanceof ApiError) {
        return rejectWithValue({ ...response });
    }

    return response.data;
};

export const setUserLoading = (service: UserService, state: WritableDraft<UserSlice>) => {
    state.status[service] = 'loading';
    state.error[service] = null;
};

export const setUserSuccess = (service: UserService, state: WritableDraft<UserSlice>) => {
    state.status[service] = 'succeeded';
    state.error[service] = null;
};

export const setUserError = (service: UserService, state: WritableDraft<UserSlice>, action: PayloadAction<ApiError | undefined>) => {
    state.status[service] = 'failed';
    state.error[service] = action.payload ?? null;
};


// exporting types
export type { RetryMeta } from './types';
// exporting reducers
export * from './reducers/user.reducer';
// exporting thunks
export * from './features/account/account.user.thunk';
export * from './features/auth/auth.user.thunk';
export * from './features/profile/profile.user.thunk';
export * from './features/session/session.user.thunk';
// exporting utils
export * from './utils/retryRegistry.util';


import { useEffect } from 'react';

/**
 * Custom hook to debounce an effect callback
 * @param func The function to execute after debounce
 * @param dependencies Dependency array for when to trigger
 * @param delay Debounce delay in ms
*/
export const useDebounce = (
    func: () => void | Promise<void>,
    dependencies: any[],
    delay: number
) => {
    useEffect(() => {
        const handler = setTimeout(() => {
            func();
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [...dependencies, delay]);
};


import { ApiError } from '@syncspace/shared';
// importing contexts
import { useSnackBarContext } from '../contexts/snackbar.context';

export const useErrorSnackBar = () => {
    const { openSnackBar } = useSnackBarContext();

    const showErrorSnackBar = (response: any) => {
        if (response instanceof ApiError) {
            openSnackBar({
                status: 'error',
                message: response.message,
            });
        }
    };

    return showErrorSnackBar;
};


import { Suspense } from 'react';
// importing types
import type { JSX, LazyExoticComponent, ReactNode } from 'react';
// importing components
import { CenteredBox } from '../components/CenteredBox';

export const useLazyLoad = () => {
    const Load = (
        Component: LazyExoticComponent<() => JSX.Element>,
        fallback?: ReactNode,
    ) => {
        if (!fallback) {
            fallback = (
                <CenteredBox sx={{ height: '100vh', width: '100vw', color: 'text.primary', bgcolor: 'background.default' }}>
                    Loading Page...
                </CenteredBox>
            );
        }

        return (
            <Suspense fallback={fallback} >
                <Component />
            </Suspense>
        );
    };
    return Load;
};


import { useMediaQuery } from '@mui/material';
// importing data
import { clientConfig } from '../data/constants.data';

export const useMobile = () => {
    const { mobileBreakpointPx } = clientConfig;

    const isMobile = useMediaQuery(`(max-width:${mobileBreakpointPx}px)`);

    return isMobile;
};


import { useEffect } from 'react';

export const useNoScroll = (condition: boolean) => {
    useEffect(() => {
        if (condition) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [condition]);
};


import axios from 'axios';
import { checkError } from '@syncspace/shared';
// importing app
import { store } from '../app/store';
// importing features
import { setAccessToken, logUserOut } from '../features/user';

axios.defaults.withCredentials = true;

export const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

// attach token to outgoing requests
API.interceptors.request.use(
    (config) => {
        const token = store.getState().user.accessToken;
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// response interceptor: handle expired access token, queue concurrent requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeRefresh = (callback: (token: string | null) => void) => {
    refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        if (!originalRequest) return Promise.reject(error);

        if (originalRequest.url?.includes('/auth/refresh')) {
            store.dispatch(logUserOut());
            return Promise.reject(error);
        }

        if (!checkError(error, 403, 'AuthMiddleware/auth/invalidAccessToken')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeRefresh((token) => {
                    if (token) {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(API(originalRequest));
                    } else {
                        reject(error);
                    }
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshResponse = await API.post('/auth/refresh');
            const newToken = refreshResponse?.data?.data?.accessToken;
            if (!newToken) {
                throw new Error('Refresh did not return accessToken');
            }

            store.dispatch(setAccessToken(newToken));

            onRefreshed(newToken);
            isRefreshing = false;

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return API(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            onRefreshed(null);
            store.dispatch(logUserOut());
            return Promise.reject(refreshError);
        }
    }
);


import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
// importing features
import { AuthModal } from '../features/auth';
// importing types
import type { RootState } from '../types';
// importing components
import { CenteredBox } from '../components/CenteredBox';
import { PageBase } from '../components/PageBase';

const Auth = () => {
    const { mode } = useParams();

    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/', { replace: true });
        }
    }, [isLoggedIn]);

    if (mode === 'login' || mode === 'register') {
        return (
            <PageBase sx={{ height: '100vh' }}>
                <CenteredBox>
                    <AuthModal key={mode} authMode={mode} fullPage={true} />
                </CenteredBox>
            </PageBase>
        );
    }

    return navigate('/', { replace: true });
};

export default Auth;


// import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
// import { ApiError, ApiResponse, TokenActions, validateAll, validateNewPassword, type TokenAction } from '@syncspace/shared';
// import Button from '@mui/material/Button';
// // importing icons
// import ResetTokenExpiredIcon from '@mui/icons-material/CloseRounded';
// // importing features
// import { cleanup, resetPassword } from '../features/user';
// // importing types
// import type { ApiCallStatus, AppDispatch, FormState, RootState } from '../types';
// // importing hooks
// import { useErrorSnackBar } from '../hooks/useErrorSnackBar';
// // importing reducers
// import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../reducers/form.reducer';
// // importing services
// import {
//     decodeResetPasswordToken as decodeResetPasswordTokenService,
// } from '../features/auth/services/api.service';
// // importing components
// import { CenteredBox } from '../components/CenteredBox';
// import { GenericAuthModal } from '../components/GenericAuthModal';
// import { LoadingModal } from '../components/LoadingModal';
// import { PageBase } from '../components/PageBase'
// import { FormTextField } from '../components/FormTextField';

import { EmailHandler } from "../features/email";
import { CenteredBox } from '../components/CenteredBox';
import { PageBase } from '../components/PageBase';

// export type ResetPasswordField = 'newPassword';

// const Email = () => {
//     const { emailAction, emailToken } = useParams();

//     const navigate = useNavigate();
//     const showErrorSnackBar = useErrorSnackBar();

//     if (!TokenActions.includes(emailAction as TokenAction)) {
//         return navigate('/');
//     }

//     if (emailAction === 'resetPassword') {

//     }

//     // decodeResetPasswordToken
//     const [decodeResetPasswordTokenStatus, setDecodeResetPasswordTokenStatus] = useState<ApiCallStatus>('loading');

//     const decodeResetPasswordToken = async (resetPasswordToken: string) => {
//         const response = await decodeResetPasswordTokenService({ resetPasswordToken });
//         if (response instanceof ApiError) {
//             setDecodeResetPasswordTokenStatus('failed');
//         } else if (response instanceof ApiResponse) {
//             setDecodeResetPasswordTokenStatus('succeeded');
//         }
//     };

//     useEffect(() => {
//         if (resetPasswordToken) {
//             decodeResetPasswordToken(resetPasswordToken);
//         } else {
//             navigate('/', { replace: true });
//         }
//     }, [resetPasswordToken]);

//     // resetPassword
//     const dispatch = useDispatch<AppDispatch>();

//     const resetPasswordStatus = useSelector((state: RootState) => state.user.status.resetPassword);
//     const resetPasswordError = useSelector((state: RootState) => state.user.error.resetPassword);

//     const initialFormState: FormState<ResetPasswordField> = createInitialFormState(['newPassword']);
//     const [formData, formDispatch] = useReducer(formReducer<ResetPasswordField>, initialFormState);
//     const { newPassword } = formData;
//     const onChange = useMemo(() => handleFormDataChange<ResetPasswordField>(formDispatch), []);

//     const newPasswordRef = useRef<HTMLInputElement | null>(null);

//     const resetPasswordErrorHandler = createErrorHandler<ResetPasswordField>(formDispatch, [newPasswordRef]);

//     const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//         event.preventDefault();

//         try {
//             if (resetPasswordStatus === 'loading') {
//                 return;
//             }

//             const credentialsValidity = validateAll(validateNewPassword(newPassword.value));
//             if (credentialsValidity !== true) {
//                 throw credentialsValidity;
//             }

//             dispatch(resetPassword({ resetPasswordToken: resetPasswordToken as string, newPassword: newPassword.value }));
//         } catch (error) {
//             resetPasswordErrorHandler(error);
//         }
//     };

//     useEffect(() => {
//         if (resetPasswordStatus === 'succeeded') {
//             dispatch(cleanup('resetPassword'));
//             navigate('/', { replace: true });
//         }

//         if (resetPasswordStatus === 'failed' && resetPasswordError) {
//             showErrorSnackBar(new ApiError(resetPasswordError));
//             dispatch(cleanup('resetPassword'));
//         }
//     }, [resetPasswordStatus, resetPasswordError]);

//     // return 
//     if (decodeResetPasswordTokenStatus === 'loading') {
//         return (
//             <LoadingModal
//                 loader={{ progress: 'linear', size: 360 }}
//                 children='Fetching reset form'
//             />
//         );
//     }

//     return (
//         <PageBase sx={{ height: '100vh' }}>
//             <CenteredBox sx={{ height: '100%' }}>
//                 {decodeResetPasswordTokenStatus === 'failed' &&
//                     <GenericAuthModal
//                         heading='Link has expired'
//                         subHeading={`Please retry by going to login and performing forgot password. if your entered email is in db then you' ll get an email. pinky promise`}
//                         sx={{ p: 4, bgcolor: 'background.default' }}
//                         customIcon={<ResetTokenExpiredIcon />}
//                     >
//                         <CenteredBox sx={{ flexDirection: 'column', gap: 1.25, width: '100%' }}>
//                             <Button variant='contained' fullWidth onClick={() => navigate('/auth/login')}>
//                                 Navigate to login
//                             </Button>
//                             <Button variant='outlined' fullWidth onClick={() => navigate('/')}>
//                                 Navigate to home
//                             </Button>
//                         </CenteredBox>
//                     </GenericAuthModal>
//                 }
//                 {decodeResetPasswordTokenStatus === 'succeeded' &&
//                     <GenericAuthModal
//                         heading='Reset Password'
//                         subHeading='Reset password init?'
//                         sx={{ p: 4, bgcolor: 'background.default', border: '1px solid' }}
//                     >
//                         <CenteredBox
//                             component='form'
//                             sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
//                             onSubmit={handleSubmit}
//                         >
//                             <FormTextField
//                                 name='newPassword'
//                                 label='New Password'
//                                 type={'text'}
//                                 data={newPassword}
//                                 submitting={resetPasswordStatus === 'loading'}
//                                 onChange={onChange}
//                                 inputRef={newPasswordRef}
//                                 dispatch={formDispatch}
//                                 validate={validateNewPassword}
//                                 required
//                             />
//                         </CenteredBox>
//                     </GenericAuthModal>}
//             </CenteredBox>
//         </PageBase >
//     );
// };

// export default Email;

const Email = () => {
    const { action, token } = useParams();

    const navigate = useNavigate();

    if (!action || !token) {
        navigate('/', { replace: true });
        return;
    }

    return (
        <PageBase sx={{ height: '100vh' }}>
            <CenteredBox sx={{ height: '100%' }}>
                <EmailHandler action={action} token={token} />
            </CenteredBox>
        </PageBase>
    );
};

export default Email;


import { Link as NavigateLink } from 'react-router-dom';
// importing components
import { PageBase } from '../components/PageBase';

const Home = () => {
    return (
        <PageBase>
            <h1>Home</h1>
            <p><NavigateLink to='/test'>To Test</NavigateLink></p>
        </PageBase>
    );
};

export default Home;


import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ApiResponse, getRelativeTime, TargetTypes, toSentenceCase } from '@syncspace/shared';
// importing mui components
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Typography from '@mui/material/Typography';
// importing mui icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CreateIcon from '@mui/icons-material/Create';
import PersonOffIcon from '@mui/icons-material/PersonOff';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { TargetType, ActionType } from '@syncspace/shared';
import type { RootState } from '../types';
// importing contexts
import { useSnackBarContext } from '../contexts/snackbar.context';
// importing hooks
import { useDebounce } from '../hooks/useDebouce';
import { useErrorSnackBar } from '../hooks/useErrorSnackBar';
// importing services
import { fetchInteractions as fetchInteractionsService } from '../features/profile/services/api.service';
// importing components
import { PageBase } from '../components/PageBase';
import { ToolTip } from '../components/ToolTip';

export type UserInteraction = {
    _id: string,
    description: string,
    userId: string,
    action: ActionType,
    target: TargetType,
    createdAt: string,
    updatedAt: string,
};

const getInteractionIcon = (action: ActionType) => {
    const iconProps = { fontSize: 'small' as const };

    switch (action) {
        case 'account-activity':
            return <AccountCircleIcon {...iconProps} />;
        case 'account-deactivated':
            return <PersonOffIcon {...iconProps} />;
        case 'post-created':
            return <PostAddIcon {...iconProps} />;
        case 'post-commented':
            return <CommentIcon {...iconProps} />;
        case 'post-liked':
            return <FavoriteIcon {...iconProps} />;
        case 'post-saved':
            return <BookmarkIcon {...iconProps} />;
        case 'post-shared':
            return <ShareIcon {...iconProps} />;
        case 'subspace-joined':
            return <GroupAddIcon {...iconProps} />;
        case 'subspace-left':
            return <ExitToAppIcon {...iconProps} />;
        case 'subspace-created':
            return <CreateIcon {...iconProps} />;
        default:
            return <AccountCircleIcon {...iconProps} />;
    }
};

const getInteractionColor = (action: ActionType): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
    switch (action) {
        case 'account-activity':
            return 'primary';
        case 'account-deactivated':
            return 'error';
        case 'post-created':
        case 'subspace-created':
            return 'success';
        case 'post-liked':
        case 'post-saved':
            return 'error';
        case 'post-commented':
        case 'post-shared':
            return 'info';
        case 'subspace-joined':
            return 'success';
        case 'subspace-left':
            return 'warning';
        default:
            return 'primary';
    }
};

const Profile = () => {
    const { debounce } = clientConfig;

    const { username } = useParams();

    const user = useSelector((state: RootState) => state.user.user)
    const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn)

    const { openSnackBar } = useSnackBarContext();

    const showErrorSnackBar = useErrorSnackBar();

    const [userInteractions, setUserInteractions] = useState<UserInteraction[]>([]);
    const [isLoadingInteractions, setIsLoadingInteractions] = useState(false);
    const [timelineSortOrder, setTimelineSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedInteractionTargets, setSelectedInteractionTargets] = useState<TargetType[]>([...TargetTypes]);

    const fetchUserInteractions = async (targetFilters?: TargetType[]) => {
        if (isLoadingInteractions) {
            return;
        }

        setIsLoadingInteractions(true);

        const response = await fetchInteractionsService({
            page: 1,
            sortOrder: timelineSortOrder,
            ...(targetFilters && targetFilters.length !== TargetTypes.length ? { targets: targetFilters } : {}),
        });

        showErrorSnackBar(response)
        if (response instanceof ApiResponse) {
            setUserInteractions(response.data.data);
        }

        setIsLoadingInteractions(false);
    };

    const handleInteractionFilterToggle = async (targetType: TargetType) => {
        let updatedTargets: TargetType[];

        if (selectedInteractionTargets.includes(targetType)) {
            updatedTargets = selectedInteractionTargets.filter((target) => target !== targetType);
        } else {
            updatedTargets = [...selectedInteractionTargets, targetType];
        }

        setSelectedInteractionTargets(updatedTargets);

        if (updatedTargets.length === 0) {
            openSnackBar({ status: 'error', message: 'No interaction type selected' });
            setUserInteractions([]);
        }
    };

    let isFirstLoad = true;
    useEffect(() => {
        // TODO: in ABAC make a function to check if user is themself
        if (isUserLoggedIn && username === user.username) {
            fetchUserInteractions();
            isFirstLoad = false;
        } else {
            // fetch basic details by username
        }
    }, [username, isUserLoggedIn, user.username]);

    useDebounce(() => {
        if ((isUserLoggedIn && username === user.username) &&
            isFirstLoad &&
            selectedInteractionTargets.length > 0
        ) {
            fetchUserInteractions(selectedInteractionTargets);
        }

        if (!isFirstLoad) {
            isFirstLoad = true;
        }
    }, [selectedInteractionTargets, timelineSortOrder], debounce.chipSelection);

    return (
        <PageBase>
            <Card sx={{ mb: 3, p: 2 }}>
                <Stack direction='row' spacing={2} alignItems='center' flexWrap='wrap' useFlexGap>
                    <Typography variant='h6' component='h2' sx={{ minWidth: 'fit-content' }}>
                        Activity Filters:
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: 1 }}>
                        {TargetTypes.map((targetType) => (
                            <Chip
                                key={targetType}
                                label={toSentenceCase(targetType)}
                                clickable
                                color={selectedInteractionTargets.includes(targetType) ? 'primary' : 'default'}
                                variant={selectedInteractionTargets.includes(targetType) ? 'filled' : 'outlined'}
                                onClick={() => handleInteractionFilterToggle(targetType)}
                                size='small'
                            />
                        ))}
                    </Box>

                    <ToolTip title={`Sort: ${timelineSortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}>
                        <IconButton
                            onClick={() => setTimelineSortOrder(timelineSortOrder === 'desc' ? 'asc' : 'desc')}
                            color='primary'
                            size='small'
                        >
                            {timelineSortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                        </IconButton>
                    </ToolTip>
                </Stack>
            </Card>

            <Box sx={{ position: 'relative', minHeight: 200 }}>
                {userInteractions.length > 0 ? (
                    <Timeline position='right'>
                        {userInteractions.map((interaction, index) => (
                            <TimelineItem key={interaction._id}>
                                <TimelineOppositeContent
                                    sx={{
                                        m: 'auto 0',
                                        maxWidth: '120px',
                                        px: 1,
                                    }}
                                    align='right'
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    {getRelativeTime(interaction.createdAt)}
                                </TimelineOppositeContent>

                                <TimelineSeparator>
                                    <TimelineDot color={getInteractionColor(interaction.action)} variant='outlined' sx={{ p: 1 }}>
                                        {getInteractionIcon(interaction.action)}
                                    </TimelineDot>
                                    {index < userInteractions.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>

                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                    <Card
                                        variant='outlined'
                                        sx={{
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                boxShadow: 2,
                                                transform: 'translateY(-1px)',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            <Typography variant='body1' component='p' sx={{ mb: 1 }}>
                                                {interaction.description}
                                            </Typography>

                                            <Stack direction='row' spacing={1} alignItems='center'>
                                                <Chip
                                                    label={toSentenceCase(interaction.action)}
                                                    size='small'
                                                    color={getInteractionColor(interaction.action)}
                                                    variant='outlined'
                                                />
                                                <Chip label={toSentenceCase(interaction.target)} size='small' variant='outlined' />
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                ) : !isLoadingInteractions ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 200,
                            textAlign: 'center',
                            color: 'text.secondary',
                        }}
                    >
                        <AccountCircleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant='h6' gutterBottom>
                            No interactions found
                        </Typography>
                        <Typography variant='body2'>
                            {selectedInteractionTargets.length === 0
                                ? 'Please select at least one interaction type to view activities.'
                                : 'No activities match your current filters.'}
                        </Typography>
                    </Box>
                ) : null}

                <Backdrop
                    open={isLoadingInteractions}
                    sx={{
                        color: 'primary.main',
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        position: 'absolute',
                        borderRadius: 1,
                    }}
                >
                    {/* TODO: make use of LoadingModal instead */}
                    <CircularProgress color='primary' />
                </Backdrop>
            </Box>
        </PageBase>
    )
};

export default Profile;


import { Link as NavigateLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// importing contexts
import { useModalContext } from '../contexts/modal.context';
import { useSnackBarContext } from '../contexts/snackbar.context';
// importing components
import { CenteredBox } from '../components/CenteredBox';
import { PageBase } from '../components/PageBase';

const Test = () => {
    const { openModal } = useModalContext();
    const { openSnackBar } = useSnackBarContext();

    return (
        <PageBase>
            <h1>Test</h1>
            <p><NavigateLink to='/'>To Home</NavigateLink></p>

            <Container>
                <Button
                    variant='contained'
                    color='success'
                    onClick={() => openSnackBar({ status: 'success', message: 'First snackbar' })}
                >
                    First SnackBar
                </Button>
                <Button
                    variant='contained'
                    color='error'
                    onClick={() => openSnackBar({ status: 'error', message: 'Second snackbar' })}
                >
                    Second SnackBar
                </Button>
            </Container>

            <Container>
                <Button
                    variant='contained'
                    color='success'
                    onClick={() => openModal({
                        id: 'test-1',
                        isPersistent: true,
                        modalContent: {
                            title: 'First',
                            body: 'This is body'
                        },
                        modalButtons: [{
                            label: 'success',
                            onClickFunction: () => delay(true),
                        },
                        {
                            label: 'failure',
                            onClickFunction: () => delay(false),
                        }
                        ]
                    })}
                >
                    First Modal
                </Button>
                <Button
                    variant='contained'
                    color='error'
                    onClick={() => openModal({
                        id: 'test-2',
                        isPersistent: false,
                        modalContent: {
                            title: <p style={{ fontSize: '24px' }}>A Custom Title!</p>,
                            body:
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                                    This is a test
                                </Box>
                        }
                    })}
                >
                    Second Modal
                </Button>
                <Button
                    variant='contained'
                    color='info'
                    onClick={() => openModal({
                        id: 'test-3',
                        isPersistent: false,
                        modalContent: {
                            title: <p style={{ fontSize: '24px' }}>A Custom Title!</p>,
                            body:
                                <CenteredBox sx={{ height: '100%', width: '100%' }}>
                                    <ModalContent />
                                </CenteredBox>
                        }
                    })}
                >
                    Third Modal
                </Button>
            </Container>
        </PageBase>
    );
};

const delay = (value: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(value), 1000);
    });
};

const ModalContent = () => {
    const { openModal } = useModalContext();
    const { openSnackBar } = useSnackBarContext();

    return (
        <Box>
            This is a test of modelception
            <br />
            <Button
                variant='outlined'
                color='success'
                onClick={() => openModal({
                    id: 'auth',
                    isPersistent: false,
                    modalContent: {
                        title: <p style={{ fontSize: '24px' }}>A Custom Title!</p>,
                        body:
                            <CenteredBox sx={{ height: '100%', width: '100%' }}>
                                <Test />
                            </CenteredBox>
                    }, bgcolor: 'background.default'
                })}
            >
                Modal within
            </Button>
            <br />
            <Button
                variant='outlined'
                color='error'
                onClick={() => openSnackBar({ status: 'error', message: 'Second snackbar' })}
            >
                SnackBar within
            </Button>
        </Box>
    );
};

export default Test;


// importing types
import type { ChangeEvent, Dispatch } from 'react';
import type { FileAction, FileState } from '../types';

export const fileReducer = <F extends string>(
    state: FileState<F>,
    action: FileAction<F>
): FileState<F> => {
    switch (action.type) {
        case 'SET_FILE':
            return {
                ...state,
                [action.field]: { ...state[action.field], file: action.file },
            };
        case 'SET_ERROR':
            return {
                ...state,
                [action.field]: { ...state[action.field], error: action.error },
            };
        case 'RESET_FILES':
            const resetValuesState = { ...state };
            Object.keys(resetValuesState).forEach((field) => {
                resetValuesState[field as F] = {
                    ...resetValuesState[field as F],
                    file: null,
                };
            });

            return resetValuesState;
        case 'RESET_ERRORS':
            const resetErrorsState = { ...state };
            Object.keys(resetErrorsState).forEach((field) => {
                resetErrorsState[field as F] = {
                    ...resetErrorsState[field as F],
                    error: '',
                };
            });

            return resetErrorsState;
        case 'RESET_FORM':
            const fields = Object.keys(state) as F[];
            return createInitialFileState(fields);
        default:
            return state;
    }
};

export const handleFileDataChange = <F extends string>(
    fileDispatch: Dispatch<FileAction<F>>
) => (event: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    const selectedFile = files?.[0];
    if (!selectedFile) {
        fileDispatch({ type: 'SET_ERROR', field: name as F, error: 'No file selected' });
        return;
    }

    fileDispatch({ type: 'SET_FILE', field: name as F, file: selectedFile });
};

export const createInitialFileState = <F extends string>(
    fields: F[]
): FileState<F> => {
    const initialState = {} as FileState<F>;
    fields.forEach((field) => {
        initialState[field] = { file: null, error: '' };
    });

    return initialState;
};


// importing types
import type { ChangeEvent, Dispatch, RefObject } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { FormAction, FormState } from '../types';
// importing utils
import { logError } from '../utils/log.util';

export const formReducer = <F extends string>(
    state: FormState<F>,
    action: FormAction<F>
): FormState<F> => {
    switch (action.type) {
        case 'SET_VALUE':
            return {
                ...state,
                [action.field]: { ...state[action.field], value: action.value },
            };
        case 'SET_ERROR':
            return {
                ...state,
                [action.field]: { ...state[action.field], error: action.error },
            };
        case 'RESET_VALUES':
            const resetValuesState = { ...state };
            Object.keys(resetValuesState).forEach((field) => {
                resetValuesState[field as F] = {
                    ...resetValuesState[field as F],
                    value: '',
                };
            });

            return resetValuesState;
        case 'RESET_ERRORS':
            const resetErrorsState = { ...state };
            Object.keys(resetErrorsState).forEach((field) => {
                resetErrorsState[field as F] = {
                    ...resetErrorsState[field as F],
                    error: '',
                };
            });

            return resetErrorsState;
        case 'RESET_FORM':
            const fields = Object.keys(state) as F[];
            return createInitialFormState(fields);
        default:
            return state;
    }
};

export const handleFormDataChange = <F extends string>(
    formDispatch: Dispatch<FormAction<F>>
) => (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    formDispatch({ type: 'SET_VALUE', field: name as F, value });
};

export const createInitialFormState = <F extends string>(
    fields: F[]
): FormState<F> => {
    const initialState = {} as FormState<F>;
    fields.forEach((field) => {
        initialState[field] = { value: '', error: '' };
    });

    return initialState;
};

export const createErrorHandler = <Field extends string>(
    formDispatch: Dispatch<{ type: 'SET_ERROR'; field: Field; error: string }>,
    fieldMap: RefObject<HTMLInputElement | null>[]
) => {
    return (error: unknown) => {
        if (
            typeof error === 'object' &&
            error !== null &&
            ('message' in error && typeof error.message === 'string') &&
            ('src' in error && typeof error.src === 'string') &&
            ('index' in error && typeof error.index === 'number')
        ) {
            const { message, src, index } = error as IndexedValidationError;
            formDispatch({ type: 'SET_ERROR', field: src as Field, error: message });

            setTimeout(() => {
                const ref = fieldMap[index];
                ref?.current?.focus();
            }, 0);
        } else {
            logError(error);
        }
    };
};


import { ApiError, ApiResponse, checkError, handleAxiosError } from '@syncspace/shared';
// importing app
import { store } from '../app/store';
// importing features
import { logUserOut, promptReauth } from '../features/user';
// importing types
import type { AxiosResponse } from 'axios';
import type { RetryMeta } from '../features/user';
import type { ApiCall } from '../types';
// importing utils
import { logError } from '../utils/log.util';

export const apiHandler = async (
    apiCall: ApiCall,
    retryMeta?: RetryMeta,
): Promise<ApiResponse | ApiError> => {
    try {
        const res: AxiosResponse<ApiResponse> = await apiCall();
        return new ApiResponse(res.data);
    } catch (error: any) {
        if (checkError(error, 403, 'RequireReauthMiddleware/reauth/authExpired') && retryMeta) {
            store.dispatch(promptReauth(retryMeta));
        }
        if (checkError(error, 403, 'AuthMiddleware/auth/sessionExpired')) {
            if (store.getState().user.isLoggedIn) {
                store.dispatch(logUserOut());
            }
        }

        const normalizedError = handleAxiosError(error);
        logError(normalizedError);

        return normalizedError;
    }
};


// importing types
import type { EventHandler, Events } from '../types';

class EventBus {
    private events: Events = {};

    on(event: string, handler: EventHandler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    }

    off(event: string, handler: EventHandler) {
        this.events[event] = (this.events[event] || []).filter(h => h !== handler);
    }

    emit(event: string, ...args: any[]) {
        (this.events[event] || []).forEach(handler => handler(...args));
    }
}

export const eventBus = new EventBus();


// importing types
import type { store } from '../../app/store';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


// importing types
import type { ReactNode } from 'react';

export type BackDropProps = {
    opaque?: boolean,
    children: ReactNode,
};


// importing types
import type { ReactNode } from 'react';
import type { BoxProps } from '@mui/material';

export type CenteredBoxProps<C extends React.ElementType = 'div'> = {
    component?: C;
    children?: ReactNode;
    sx?: BoxProps['sx'];
} & Omit<BoxProps<C>, 'component' | 'sx' | 'children'>;


// importing types
import type { SelectChangeEvent } from '@mui/material';

export type CustomSelectProps = {
    id: string,
    name: string,
    value: string,
    onChange(event: SelectChangeEvent): void,
    list: { value: string, label: string }[],
    label?: string,
    maxHeight?: string | number,
    disabled?: boolean,
};


// importing types
import type { Dispatch, InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import type { ValidationError } from '@syncspace/shared';
import type { FileAction, FileFieldState } from '../reducers/file.reducer.type';

export type FileUploaderProps = {
    name: string,
    data: FileFieldState,
    submitting?: boolean,
    onUpload?: (file: File) => void,
    dispatch?: Dispatch<FileAction<any>>;
    validate?: (value?: File) => true | ValidationError | Promise<true | ValidationError>;
    accept: string,
    uploadIcon: ReactNode,
    size?: number,
    sx?: object,
} & InputHTMLAttributes<HTMLInputElement>;

export type FileUploaderButtonParams = {
    tooltip: string,
    icon: ReactElement,
    submitting?: boolean,
    onClick: () => void,
};


// importing types
import type { Dispatch } from 'react';
import type { TextFieldProps } from '@mui/material';
import type { ValidationError } from '@syncspace/shared';
import type { FormAction, FormFieldState } from '../reducers/form.reducer.type';

export type FormTextFieldProps = {
    name: string,
    label: string,
    data: FormFieldState,
    submitting?: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dispatch?: Dispatch<FormAction<any>>;
    validate?: (value?: string) => true | ValidationError | Promise<true | ValidationError>;
} & TextFieldProps;


// importing types 
import type { ReactElement, ReactNode } from 'react';
import type { BoxProps } from '@mui/material';
import type { LordIconStroke, LordIconTrigger } from './LordIcon.type';

export type GenericAuthModalProps = {
    heading: string,
    subHeading?: string,
    lordicon?: {
        src: string,
        trigger?: LordIconTrigger,
        stroke?: LordIconStroke,
        size?: string,
        primary?: string,
        secondary?: string,
        delay?: number,
    },
    customIcon?: ReactElement,
    children: ReactNode,
} & BoxProps;


// importing types
import type { ReactNode } from 'react';
import type { CircularProgressProps, LinearProgressProps } from '@mui/material';

export type LoaderProps = {
    size?: number,
} & (({
    progress?: 'linear',
    color?: LinearProgressProps['color'],
} & LinearProgressProps) | ({
    progress?: 'circular',
    color?: CircularProgressProps['color'],
} & CircularProgressProps));

export type LoadingModalProps = {
    loader?: LoaderProps,
    opaque?: boolean,
    children?: ReactNode,
};


export type LogoSvgProps = {
    size?: string,
    primary?: string,
    secondary?: string,
    border?: string,
};

export type LogoTextProps = {
    text: {
        size?: string,
        color?: string,
        content: string,
    },
};

export type LogoProps = {
    logo?: {
        hide?: boolean,
        size: string,
        color: {
            primary: string,
            secondary: string,
            border: string,
        },
    },
    text?: {
        hide?: boolean,
        color: string,
    },
    sx?: object,
};


export type LordIconTrigger = 'in' | 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'boomerang';

export type LordIconStroke = 'light' | 'bold';

export type LordIconProps = {
    src: string,
    size: string,
    trigger: LordIconTrigger,
    primary: string,
    secondary: string,
    delay?: number,
    stroke?: LordIconStroke,
};


// importing types
import type { ModalState, ModalType } from '../contexts/modal.context.type';

export type ModalProps = {
    modalData: ModalState,
    onClose: (_id: ModalType) => void,
};


// importing types
import type { ReactNode } from 'react';
import type { BoxProps } from '@mui/material';

export type PageBaseProps = {
    sx?: object,
    children?: ReactNode,
} & BoxProps;


// importing types
import type { SnackBarState } from '../contexts/snackbar.context.type';

export type SnackBarProps = {
    snackBarData: SnackBarState,
    onClose: (_id: number) => void,
};


// importing types
import type { ReactElement } from 'react';
import type { PopperPlacementType, TooltipProps } from '@mui/material';

export type ToolTipProps = {
    title: string,
    children: ReactElement,
    placement?: PopperPlacementType,
    duration?: number,
} & TooltipProps;


// importing types;
import type { ReactElement } from 'react';
import type { ButtonProps } from '@mui/material';

export type ModalButton = {
    label: string,
    onClickFunction: () => Promise<boolean> | boolean,
    autoFocus?: boolean,
} & ButtonProps;

type ModalBase = {
    id: ModalType,
    isPersistent?: boolean,
    maxWidth?: string,
    bgcolor?: string,
    unstyled?: boolean,
    modalButtons?: ModalButton[],
};

export type ModalState = ({
    hideTitle: true,
    modalContent: {
        body: string | ReactElement,
    },
    closeButton?: {
        top: string,
        right: string,
    }
} | {

    hideTitle?: false | undefined,
    modalContent: {
        title: string | ReactElement,
        body: string | ReactElement,
    },
}) & ModalBase;

export const ModalTypes = ['auth', 'reauth', 'forgotPassword', 'setting', 'resetSetting', 'deleteAccount'] as const;
export type ModalType = typeof ModalTypes[number];

export type ModalUpdate = {
    id: ModalType;
} & Partial<Omit<ModalState, "id">>;

export type ModalContextType = {
    modals: ModalState[],
    openModal: (data: ModalState) => void,
    editModal: (data: ModalUpdate) => void,
    replaceModal: (data: ModalState) => void,
    closeModal: (_id: ModalType) => void,
};


// importing types
import type { AlertColor } from '@mui/material';

export type AlertState = {
    status: AlertColor,
    message: string,
};

export type SnackBarState = { id: number } & AlertState;

export type SnackBarContextType = {
    snackBars: SnackBarState[],
    openSnackBar: (data: AlertState) => void,
    closeSnackBar: (id: number) => void,
};


// importing types
import type { Theme as MuiTheme, PaletteOptions } from '@mui/material';
import type { Theme } from '@syncspace/shared';

export type ThemeContextType = {
    theme: Theme,
    palette: Record<Theme, PaletteOptions>,
    designTokens: MuiTheme,
};


export type FileFieldState = {
    file: File | null,
    error: string,
};

export type FileState<F extends string> = Record<F, FileFieldState>;

export type FileAction<F extends string> =
    | { type: 'SET_FILE', field: F, file: File | null }
    | { type: 'SET_ERROR', field: F, error: string }
    | { type: 'RESET_FILES', }
    | { type: 'RESET_ERRORS', }
    | { type: 'RESET_FORM' };


export type FormFieldState = {
    value: string,
    error: string,
};

export type FormState<F extends string> = Record<F, FormFieldState>;

export type FormAction<F extends string> =
    | { type: 'SET_VALUE', field: F, value: string }
    | { type: 'SET_ERROR', field: F, error: string }
    | { type: 'RESET_VALUES', }
    | { type: 'RESET_ERRORS', }
    | { type: 'RESET_FORM' };


// importing types
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@syncspace/shared';

export type ApiCall = () => Promise<AxiosResponse<ApiResponse>>;

export type ApiCallStatus = 'idle' | 'loading' | 'succeeded' | 'failed';


export type Events = Record<string, EventHandler[]>;

export type EventHandler = (...args: any[]) => void;


export type ScrollToParams = {
    to: string,
    duration?: number,
    smooth?: string,
};


// importing types
import type { ReactNode } from 'react';

export * from './app/store.type';

export * from './components/BackDrop.type';
export * from './components/CenteredBox.type';
export * from './components/CustomSelect.type';
export * from './components/FileUploader.type';
export * from './components/FormTextField.type';
export * from './components/GenericAuthModal.type';
export * from './components/LoadingModal.type';
export * from './components/Logo.type';
export * from './components/LordIcon.type';
export * from './components/Modals.type';
export * from './components/PageBase.type';
export * from './components/SnackBars.type';
export * from './components/ToolTip.type';

export * from './contexts/snackbar.context.type';
export * from './contexts/modal.context.type';
export * from './contexts/theme.context.type';

export * from './reducers/file.reducer.type';
export * from './reducers/form.reducer.type';

export * from './services/api.service.type';
export * from './services/eventBus.service.type';

export * from './utils/navigate.util.type';

export type ContextProviderProps = {
    children: ReactNode;
};


export const delay = (ms: number): Promise<true> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms);
    });
};


const isDev = import.meta.env.VITE_MODE === 'DEVELOPMENT';

export const logMessage = (...args: any[]) => {
    if (isDev) {
        console.log(...args);
    }
};

export const logWarn = (...args: any[]) => {
    if (isDev) {
        console.warn(...args);
    }
};

export const logError = (...args: any[]) => {
    if (isDev) {
        console.error(...args);
    }
};

export const logDir = (...args: any[]) => {
    if (isDev) {
        console.dir(...args);
    }
};


import { scroller } from 'react-scroll';
// importing data
import { clientConfig } from '../data/constants.data';
// importing types
import type { ScrollToParams } from '../types';

export const scrollTo = (params: ScrollToParams) => {
    const { to, duration, smooth = 'easeInOutQuad' } = params;

    const { transitionDurationMs } = clientConfig;

    scroller.scrollTo(to, {
        duration: duration ?? transitionDurationMs,
        smooth: smooth,
    });
};

export const linkTo = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '__blank';
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};


import { lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// importing features
import { NavBar } from './features/navbar';
import { fetchSession } from './features/user';
import { useReauthListener } from './features/reauth';
import { useSocket } from './features/socket';
// importing types
import type { AppDispatch, RootState } from './types';
// importing hooks
import { useLazyLoad } from './hooks/useLazyLoad';
// importing components
import { LoadingModal } from './components/LoadingModal';
import { Modals } from './components/Modals';
import { SnackBars } from './components/SnackBars';
// importing pages
import Auth from './pages/Auth.page';
import Email from './pages/Email.page';

// lazy-loading pages
const Home = lazy(() => import('./pages/Home.page'));
const Profile = lazy(() => import('./pages/Profile.page'));
const Test = lazy(() => import('./pages/Test.page'));

export const App = () => {
    useReauthListener();
    useSocket();

    const dispatch = useDispatch<AppDispatch>();
    const fetchSessionStatus = useSelector((state: RootState) => state.user.status.fetchSession);

    const Load = useLazyLoad();

    useEffect(() => {
        dispatch(fetchSession());
    }, []);

    if (fetchSessionStatus === 'loading') {
        return <LoadingModal opaque={true} />;
    }

    return (
        <BrowserRouter>
            <NavBar />
            {/* <SideBar />  -  Left*/}
            {/* <SwitchAccount />  -  Right*/}
            {/* <Messaging />  -  Draggable*/}
            <Routes>
                <Route path='/' element={Load(Home)} />
                <Route path='/profile/:username' element={Load(Profile)} />
                <Route path='/auth/:mode' Component={Auth} />
                <Route path='/email/:action/:token' Component={Email} />
                <Route path='/test' element={Load(Test)} />
                <Route path='*' element={<Navigate to='/' />} />
            </Routes>
            <Modals />
            <SnackBars />
        </BrowserRouter>
    );
};


@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

:root {
    --text: #000000;
    --bg: #eeeeee;
}

@media (prefers-color-scheme: dark) {
    :root {
        --text: #ffffff;
        --bg: #000000;
    }
}

body {
    color: var(--text);
    background: var(--bg);
}

* {
    padding: 0;
    margin: 0;
    font-family: 'Roboto', sans-serif;
    font-weight: 350;
    box-sizing: border-box;
}

a {
    text-decoration: none;
}


import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// importing app
import { store } from './app/store';
// importing providers
import { ModalProvider } from './contexts/modal.context';
import { SnackBarProvider } from './contexts/snackbar.context';
import { ThemeProvider } from './contexts/theme.context';
// importing components
import { App } from './App';
// importing styling
import './index.css';

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <ThemeProvider>
            <ModalProvider>
                <SnackBarProvider>
                    <App />
                </SnackBarProvider>
            </ModalProvider>
        </ThemeProvider>
    </Provider>
);


/// <reference types='vite/client' />

interface ImportMeta {
    readonly env: ImportMetaEnv,
};

interface ImportMetaEnv {
    readonly VITE_MODE: 'DEVELOPMENT' | 'PRODUCTION',
    readonly VITE_BACKEND_URL: string,
    readonly VITE_SOCKET_URL: string,
};


VITE_MODE = "DEVELOPMENT"
VITE_BACKEND_URL = "http://localhost:8080"
VITE_SOCKET_URL = "http://localhost:8000"


<!doctype html>
<html lang='en'>

<head>
    <meta charset='UTF-8' />
    <meta name='viewport' content='width=device-width, initial-scale=1.0' />

    <meta name='keywords' content='SyncSpace, Social Network, Social Media' />
    <meta name='description' content='SyncSpace: A Community-Driven Social Network. Think Reddit meets Twitter' />

    <meta name='color-scheme' content='light dark' />

    <meta name='author' content='Karan Bisht' />

    <title>SyncSpace</title>
</head>

<body>
    <div id='root'></div>
    <script src='https://cdn.lordicon.com/lordicon.js'></script>
    <script type='module' src='./src/main.tsx'></script>
</body>

</html>


{
    "name": "@syncspace/client",
    "version": "0.0.0",
    "description": "Client for SyncSpace",
    "type": "module",
    "main": "index.js",
    "scripts": {
        "dev": "vite",
        "build": "tsc -b && vite build",
        "lint": "eslint .",
        "preview": "vite preview"
    },
    "dependencies": {
        "@emotion/react": "^11.14.0",
        "@emotion/styled": "^11.14.1",
        "@mui/icons-material": "^7.2.0",
        "@mui/lab": "^7.0.0-beta.17",
        "@mui/material": "^7.2.0",
        "@reduxjs/toolkit": "^2.9.0",
        "@syncspace/shared": "^0.0.0",
        "axios": "^1.11.0",
        "ldrs": "^1.1.7",
        "react": "^19.1.0",
        "react-dom": "^19.1.0",
        "react-redux": "^9.2.0",
        "react-router-dom": "^7.7.1",
        "react-scroll": "^1.9.3",
        "socket.io-client": "^4.8.1"
    },
    "devDependencies": {
        "@eslint/js": "^9.30.1",
        "@types/react": "^19.1.8",
        "@types/react-dom": "^19.1.6",
        "@types/react-scroll": "^1.8.10",
        "@vitejs/plugin-react": "^4.6.0",
        "eslint": "^9.30.1",
        "eslint-plugin-react-hooks": "^5.2.0",
        "eslint-plugin-react-refresh": "^0.4.20",
        "globals": "^16.3.0",
        "typescript-eslint": "^8.35.1",
        "vite": "^7.0.4"
    },
    "repository": {
        "type": "git",
        "url": "[ADD]"
    },
    "author": "Karan_Bisht16",
    "license": "ISC"
}


{
    "extends": "../../tsconfig.base.json",
    "files": [],
    "references": [
        {
            "path": "./tsconfig.app.json"
        },
        {
            "path": "./tsconfig.node.json"
        }
    ]
}


import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
    },
});