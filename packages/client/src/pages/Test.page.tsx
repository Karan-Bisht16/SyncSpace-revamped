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