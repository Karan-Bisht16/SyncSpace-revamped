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