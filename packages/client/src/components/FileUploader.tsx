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