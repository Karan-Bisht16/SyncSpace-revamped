This is a classic architectural pattern known as "Interception Routes" or "Modal Routes" (popularized by Instagram, Pinterest, and Twitter).

Here is the best way to handle this:

URL Strategy: Use clean URLs like /auth/login. Do not append URLs like /home/auth/login.

Why? Appending creates infinite URL variations (/profile/auth/login, /about/auth/login) which ruins caching and SEO.

Rerouting: You do not need to force a full reroute. React Router v6 supports "Background Locations." This lets you update the URL to /auth/login while keeping the previous page (/home or /profile) rendered and visible in the background.

Here is how to refactor your code to achieve this.

1. Create a Route-Aware Modal Wrapper
First, we need a wrapper that acts like your normal Modals but is controlled by the URL/Router rather than your Context.

Create a new component components/AuthRouteModal.tsx:

TypeScript

import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Auth from '../pages/Auth.page'; // Importing your existing Auth Page

export const AuthRouteModal = () => {
    const navigate = useNavigate();
    const { mode } = useParams(); // Gets 'login' or 'signup' from /auth/:mode

    const handleClose = () => {
        // Go back to the previous route (closes the modal effectively)
        navigate(-1);
    };

    return (
        <Dialog 
            open={true} 
            onClose={handleClose}
            maxWidth="sm" // Adjust based on your Auth design
            fullWidth
        >
            <Box sx={{ p: 4 }}>
                {/* Reuse your existing Auth Page Component */}
                {/* You might need to adjust Auth.page to accept props to hide its own layout if needed */}
                <Auth />
            </Box>
        </Dialog>
    );
};
2. Refactor App.tsx
To use background locations, we must use useLocation(). However, useLocation only works inside the BrowserRouter. We need to split your App into two parts.

Update App.tsx:

TypeScript

import { lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// ... existing imports ...
import { NavBar } from './features/navbar';
import { fetchSession } from './features/user';
import { useReauthListener } from './features/reauth';
import { useSocket } from './features/socket';
import { LoadingModal } from './components/LoadingModal';
import { Modals } from './components/Modals';
import { SnackBars } from './components/SnackBars';
import { AuthRouteModal } from './components/AuthRouteModal'; // Import the new component

// ... lazy imports ...
const Home = lazy(() => import('./pages/Home.page'));
const Profile = lazy(() => import('./pages/Profile.page'));
const Auth = lazy(() => import('./pages/Auth.page')); // Ensure this is imported for the fallback route
// ... other imports

// 1. Create a sub-component for the inner routing logic
const AppRoutes = () => {
    const location = useLocation();
    const Load = useLazyLoad(); // Your custom hook

    // The Magic: Check if we have a "background" state
    // If we do, it means we opened a modal on top of a page.
    // If not, it means the user went directly to /auth/login (hard refresh).
    const state = location.state as { background?: Location };
    const background = state?.background;

    return (
        <>
            <NavBar />
            
            {/* If background exists, use it for the main Routes. 
               This tricks React into thinking we are still at '/home' 
               even though the URL says '/auth/login'.
            */}
            <Routes location={background || location}>
                <Route path='/' element={Load(Home)} />
                <Route path='/profile/:username' element={Load(Profile)} />
                
                {/* Direct Access Fallback: If user refreshes on /auth/login, this renders as a full page */}
                <Route path='/auth/:mode' element={<Auth />} /> 
                
                {/* ... other routes ... */}
                <Route path='*' element={<Navigate to='/' />} />
            </Routes>

            {/* This route only renders if we have a background.
               It renders ON TOP of the previous Routes.
            */}
            {background && (
                <Routes>
                    <Route path='/auth/:mode' element={<AuthRouteModal />} />
                </Routes>
            )}

            <Modals /> {/* Your existing context-modals (for alerts/settings) */}
            <SnackBars />
        </>
    );
};

// 2. Main App Component
export const App = () => {
    useReauthListener();
    useSocket();

    const dispatch = useDispatch<AppDispatch>();
    const fetchSessionStatus = useSelector((state: RootState) => state.user.status.fetchSession);

    useEffect(() => {
        dispatch(fetchSession());
    }, []);

    if (fetchSessionStatus === 'loading') {
        return <LoadingModal opaque={true} />;
    }

    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
};
3. How to Trigger the Modal (e.g., in NavBar)
When you link to the login page from your Navbar (or anywhere else), you must pass the state property. This tells the router "Keep the current page as the background."

In your NavBar.tsx (or wherever your login button is):

TypeScript

import { Link, useLocation } from 'react-router-dom';

export const NavBar = () => {
    const location = useLocation();

    return (
        <nav>
            {/* ... other links ... */}

            {/* OPEN AS MODAL */}
            <Link 
                to="/auth/login" 
                state={{ background: location }} // <--- CRITICAL
            >
                Login
            </Link>
            
            <Link 
                to="/auth/signup" 
                state={{ background: location }} 
            >
                Sign Up
            </Link>
        </nav>
    );
};
Summary of Behavior
User clicks "Login" on Home:

URL changes to /auth/login.

location.state.background is set to /home.

<AuthRouteModal /> renders on top.

Home page stays visible behind the modal.

User copies link /auth/login and sends to a friend:

Friend opens link.

location.state.background is undefined (new session).

The background && ... condition fails (Modal doesn't render).

The standard <Route path='/auth/:mode' ...> renders.

Result: They see the standalone Login Page (not a modal).


-----
Here is the refactored, modularized version. I have removed the @mui/lab dependency and recreated the timeline look using standard Box, Stack, and Grid components from @mui/material.

1. features/profile/utils/interaction.utils.tsx
Moves the icon and color logic out of the main component.

TypeScript

import type { ActionType } from '@syncspace/shared';
// importing icons
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

export const getInteractionIcon = (action: ActionType) => {
    const iconProps = { fontSize: 'small' as const };

    switch (action) {
        case 'account-activity': return <AccountCircleIcon {...iconProps} />;
        case 'account-deactivated': return <PersonOffIcon {...iconProps} />;
        case 'post-created': return <PostAddIcon {...iconProps} />;
        case 'post-commented': return <CommentIcon {...iconProps} />;
        case 'post-liked': return <FavoriteIcon {...iconProps} />;
        case 'post-saved': return <BookmarkIcon {...iconProps} />;
        case 'post-shared': return <ShareIcon {...iconProps} />;
        case 'subspace-joined': return <GroupAddIcon {...iconProps} />;
        case 'subspace-left': return <ExitToAppIcon {...iconProps} />;
        case 'subspace-created': return <CreateIcon {...iconProps} />;
        default: return <AccountCircleIcon {...iconProps} />;
    }
};

export const getInteractionColor = (action: ActionType): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' => {
    switch (action) {
        case 'account-activity': return 'primary';
        case 'account-deactivated': return 'error';
        case 'post-created':
        case 'subspace-created': return 'success';
        case 'post-liked':
        case 'post-saved': return 'error';
        case 'post-commented':
        case 'post-shared': return 'info';
        case 'subspace-joined': return 'success';
        case 'subspace-left': return 'warning';
        default: return 'primary';
    }
};
2. features/profile/components/InteractionFilters.tsx
Encapsulates the filtering and sorting UI.

TypeScript

import { toSentenceCase, TargetTypes } from '@syncspace/shared';
import type { TargetType } from '@syncspace/shared';
// importing mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// importing icons
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// importing components
import { ToolTip } from '../../../components/ToolTip';

type InteractionFiltersProps = {
    selectedTargets: TargetType[];
    onToggleTarget: (target: TargetType) => void;
    sortOrder: 'asc' | 'desc';
    onSortChange: () => void;
};

export const InteractionFilters = ({
    selectedTargets,
    onToggleTarget,
    sortOrder,
    onSortChange
}: InteractionFiltersProps) => {

    return (
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
                            color={selectedTargets.includes(targetType) ? 'primary' : 'default'}
                            variant={selectedTargets.includes(targetType) ? 'filled' : 'outlined'}
                            onClick={() => onToggleTarget(targetType)}
                            size='small'
                        />
                    ))}
                </Box>

                <ToolTip title={`Sort: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}>
                    <IconButton
                        onClick={onSortChange}
                        color='primary'
                        size='small'
                    >
                        {sortOrder === 'desc' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                    </IconButton>
                </ToolTip>
            </Stack>
        </Card>
    );
};
3. features/profile/components/InteractionItem.tsx
Replaces the TimelineItem with a manual Flexbox layout.

TypeScript

import { toSentenceCase, getRelativeTime, ActionType, TargetType } from '@syncspace/shared';
// importing mui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
// importing utils
import { getInteractionColor, getInteractionIcon } from '../utils/interaction.utils';

export type UserInteraction = {
    _id: string;
    description: string;
    userId: string;
    action: ActionType;
    target: TargetType;
    createdAt: string;
    updatedAt: string;
};

type InteractionItemProps = {
    interaction: UserInteraction;
    isLast: boolean;
};

export const InteractionItem = ({ interaction, isLast }: InteractionItemProps) => {
    const theme = useTheme();
    const colorKey = getInteractionColor(interaction.action);
    
    // Determine the actual color hex/string from theme palette for the Avatar background
    // (You might need to adjust this depending on your theme structure, e.g. theme.palette[colorKey].main)
    const avatarColor = theme.palette[colorKey]?.main || theme.palette.primary.main;

    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Left Column: Date */}
            <Box sx={{ minWidth: '100px', textAlign: 'right', pt: 1, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
                    {getRelativeTime(interaction.createdAt)}
                </Typography>
            </Box>

            {/* Middle Column: Visual Timeline (Dot + Line) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'background.paper',
                        border: `1px solid ${avatarColor}`,
                        color: avatarColor,
                        zIndex: 1
                    }}
                >
                    {getInteractionIcon(interaction.action)}
                </Avatar>
                
                {!isLast && (
                    <Box 
                        sx={{ 
                            width: '2px', 
                            bgcolor: 'divider', 
                            flexGrow: 1, 
                            my: 0.5,
                            minHeight: '20px' // Ensures line exists even if content is short
                        }} 
                    />
                )}
            </Box>

            {/* Right Column: Content Card */}
            <Box sx={{ flexGrow: 1, pb: 3, maxWidth: '100%' }}>
                {/* Mobile Date (shown above card on small screens) */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 0.5 }}>
                     <Typography variant='caption' color='text.secondary'>
                        {getRelativeTime(interaction.createdAt)}
                    </Typography>
                </Box>

                <Card
                    variant='outlined'
                    sx={{
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-1px)',
                            borderColor: avatarColor, 
                        },
                    }}
                >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant='body1' component='p' sx={{ mb: 1.5 }}>
                            {interaction.description}
                        </Typography>

                        <Stack direction='row' spacing={1} alignItems='center'>
                            <Chip
                                label={toSentenceCase(interaction.action)}
                                size='small'
                                color={colorKey}
                                variant='outlined'
                                sx={{ height: 24 }}
                            />
                            <Chip 
                                label={toSentenceCase(interaction.target)} 
                                size='small' 
                                variant='outlined'
                                sx={{ height: 24 }} 
                            />
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};
4. pages/Profile.page.tsx
The main controller that stitches everything together.

TypeScript

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ApiResponse, TargetTypes } from '@syncspace/shared';
// importing mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// importing types
import type { TargetType } from '@syncspace/shared';
import type { RootState } from '../types';
import type { UserInteraction } from '../features/profile/components/InteractionItem';
// importing contexts
import { useSnackBarContext } from '../contexts/snackbar.context';
// importing hooks
import { useDebounce } from '../hooks/useDebouce';
import { useErrorSnackBar } from '../hooks/useErrorSnackBar';
// importing services
import { fetchInteractions as fetchInteractionsService } from '../features/profile/services/api.service';
// importing components
import { PageBase } from '../components/PageBase';
import { LoadingModal } from '../components/LoadingModal';
import { InteractionFilters } from '../features/profile/components/InteractionFilters';
import { InteractionItem } from '../features/profile/components/InteractionItem';
import { clientConfig } from '../data/constants.data';

const Profile = () => {
    const { debounce } = clientConfig;
    const { username } = useParams();

    const user = useSelector((state: RootState) => state.user.user);
    const isUserLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

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

        showErrorSnackBar(response);
        if (response instanceof ApiResponse) {
            setUserInteractions(response.data.data);
        }

        setIsLoadingInteractions(false);
    };

    const handleInteractionFilterToggle = (targetType: TargetType) => {
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
        if (isUserLoggedIn && username === user.username) {
            fetchUserInteractions();
            isFirstLoad = false;
        } else {
            // fetch basic details by username
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <InteractionFilters 
                selectedTargets={selectedInteractionTargets}
                onToggleTarget={handleInteractionFilterToggle}
                sortOrder={timelineSortOrder}
                onSortChange={() => setTimelineSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            />

            <Box sx={{ position: 'relative', minHeight: 200 }}>
                {userInteractions.length > 0 ? (
                    <Box sx={{ p: 1 }}>
                        {userInteractions.map((interaction, index) => (
                            <InteractionItem 
                                key={interaction._id}
                                interaction={interaction}
                                isLast={index === userInteractions.length - 1}
                            />
                        ))}
                    </Box>
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
                            py: 8
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

                {/* Using your existing LoadingModal logic or a local overlay */}
                {isLoadingInteractions && (
                   <LoadingModal opaque={false} /> 
                )}
            </Box>
        </PageBase>
    );
};

export default Profile;


-----