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
[NEW CONTENT]

Perfect use-case for AWS SES 👍
SES does NOT use Nodemailer, so it usually passes org restrictions, and Free Tier is enough for most projects.

Below I’ll show you how to replicate your existing Nodemailer flow with AWS SES, keeping your structure almost identical.

0️⃣ AWS SES Free Tier (important facts)
✅ Free Tier (while in sandbox)

62,000 emails / month

Only to verified emails

Only from verified sender

No custom domain required initially

To go production:

Request SES sandbox removal (1–2 days approval)

1️⃣ AWS setup (one-time)
Step 1: Create IAM user

Give permissions:

{
  "Effect": "Allow",
  "Action": ["ses:SendEmail", "ses:SendRawEmail"],
  "Resource": "*"
}


Save:

AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY

Step 2: Verify email

SES Console → Verified identities → Verify sender email

This replaces:

NODEMAILER_EMAIL

2️⃣ Install AWS SDK (SES v3)
npm install @aws-sdk/client-ses

3️⃣ Environment variables
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1

SES_FROM_EMAIL=no-reply@yourdomain.com

4️⃣ SES client (replaces Nodemailer transporter)
src/lib/ses.ts
import { SESClient } from "@aws-sdk/client-ses";

export const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

5️⃣ Replace sendMail (SES version)
✅ Direct replacement for Nodemailer logic
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "../lib/ses.js";
import { logToDb } from "../services/log.service.js";
import type { SendMailParams } from "../types/index.js";

export const sendMail = async (params: SendMailParams) => {
  const { req, to, subject, html } = params;

  try {
    const command = new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
        },
      },
    });

    await sesClient.send(command);
  } catch (error: any) {
    await logToDb({
      type: "error",
      payload: {
        req,
        description: error.message,
        userId: req.user?._id,
        stack: error.stack,
      },
    });
  }
};


✔ Async / await
✔ Same error logging
✔ No SMTP
✔ No Nodemailer

6️⃣ getEmail stays the same
export const getEmail = (user: UserDocument) => {
  if (MODE === "DEVELOPMENT") {
    return "karan161003@gmail.com";
  }
  return user.email;
};


SES sandbox requires verified email → perfect for dev.

7️⃣ getEmailLink stays EXACTLY the same

No SES changes needed:

export const getEmailLink = async (params: GetEmailLinkParams) => {
  const { req, action, data, expiresIn } = params;

  const origin = validateReqOrigin(req);

  const emailToken = jwt.sign(
    { action, ...data },
    EMAIL_SECRET,
    { expiresIn: expiresIn as any }
  );

  return `${origin}/email/${action}/${emailToken}`;
};

8️⃣ Feature parity with Nodemailer
Feature	Nodemailer	SES
HTML emails	✅	✅
Attachments	✅	✅ (SendRawEmail)
Bulk send	⚠️	✅
Tracking	❌	✅
Rate limiting	❌	✅
API based	❌	✅
9️⃣ SES with attachments (optional)
import { SendRawEmailCommand } from "@aws-sdk/client-ses";


I’ll skip this unless you ask — it’s a bit verbose.

🔐 Security notes (important)

Never commit AWS keys

Use IAM role in prod (EC2 / ECS / Lambda)

Restrict SES region

Set bounce/complaint SNS later

✅ TL;DR (Drop-in replacement)

Nodemailer ❌

SES SDK ✅

No SMTP

Free tier friendly

Works in restricted orgs


-----

Here is a complete solution implementing a modern, sleek Profile page with in-place editing, following your specific architecture and strict TypeScript/MUI requirements.

1. Updated Redux Thunks & Types
First, we need to add the updateProfile logic. I am assuming your API accepts multipart/form-data because we are dealing with file uploads (profilePic, banner).

types/profile.types.ts (New or appended to existing types)

TypeScript

export interface SocialItem {
    platform: string;
    url: string;
}

export interface UpdateProfileParams {
    username: string;
    bio: string;
    socials: SocialItem[];
    // Files are optional as user might not update them
    profilePic?: File;
    banner?: File;
}
features/profile/profile.user.thunk.ts

TypeScript

import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiError, UserClientBase } from '@syncspace/shared';
// Assume you have an api service for this
import { updateProfile as updateProfileService } from '../../services/api.service'; 
import { handleUserResponse } from '../../utils/userSlice.utils';
import { UpdateProfileParams } from '../../types';

export const updateProfile = createAsyncThunk<
    UserClientBase,
    UpdateProfileParams,
    { rejectValue: ApiError }
>('profile/updateProfile', async (data, { rejectWithValue }) => {
    // Convert DTO to FormData for file handling
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('bio', data.bio);
    formData.append('socials', JSON.stringify(data.socials)); // Send complex arrays as JSON string
    
    if (data.profilePic) formData.append('profilePic', data.profilePic);
    if (data.banner) formData.append('banner', data.banner);

    const response = await updateProfileService(formData);
    return handleUserResponse(response, rejectWithValue);
});

// ... existing exports (updateEmail, verifyEmail)
features/profile/profile.user.reducer.ts

TypeScript

import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { UserSlice } from '../../types';
import { updateProfile } from './profile.user.thunk';
import {
    setUserError,
    setUserLoading,
    setUserSuccess,
} from '../../utils/userSlice.utils';

// ... existing imports

export const profileExtraReducers = (builder: ActionReducerMapBuilder<UserSlice>) => {
    // ... existing builder cases for updateEmail/verifyEmail

    // Update Profile Cases
    builder
        .addCase(updateProfile.pending, (state) => {
            setUserLoading('updateProfile', state);
        })
        .addCase(updateProfile.fulfilled, (state, action) => {
            state.user = action.payload;
            setUserSuccess('updateProfile', state);
        })
        .addCase(updateProfile.rejected, (state, action) => {
            setUserError('updateProfile', state, action);
        });
};
2. The Profile Page Component
This component handles the view logic, form state, image previews, and conditional rendering (Read vs. Edit mode).

pages/Profile/UserProfile.tsx

TypeScript

import React, { useState, useEffect, ChangeEvent } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Avatar,
    Paper,
    Grid,
    IconButton,
    TextField,
    Stack,
    MenuItem,
    Select,
    InputAdornment,
    CircularProgress,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    PhotoCamera as CameraIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Language as WebIcon,
    Twitter,
    Instagram,
    Facebook,
    LinkedIn,
    Reddit
} from '@mui/icons-material';

// Redux
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { updateProfile } from '../../features/profile/profile.user.thunk';
import type { SocialItem } from '../../types';

// --- Helper Components & Constants ---

const SOCIAL_PLATFORMS = ['Twitter', 'Reddit', 'Instagram', 'Facebook', 'LinkedIn', 'Website', 'Other'];

const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'twitter': return <Twitter />;
        case 'instagram': return <Instagram />;
        case 'facebook': return <Facebook />;
        case 'linkedin': return <LinkedIn />;
        case 'reddit': return <Reddit />;
        default: return <WebIcon />;
    }
};

const SocialLink = ({ platform, url }: SocialItem) => (
    <IconButton 
        component="a" 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        color="primary"
        title={platform}
    >
        {getSocialIcon(platform)}
    </IconButton>
);

// --- Main Component ---

const UserProfile = () => {
    const dispatch = useAppDispatch();
    const { user, status } = useAppSelector((state) => state.user);
    const isLoading = status.updateProfile === 'loading';

    // Toggle Mode
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [socials, setSocials] = useState<SocialItem[]>(user?.socials || []);
    
    // Image Preview State (Local only)
    const [bannerPreview, setBannerPreview] = useState<string | null>(user?.banner?.highRes?.url || null);
    const [profilePreview, setProfilePreview] = useState<string | null>(user?.profilePic?.highRes?.url || null);
    
    // File State (For upload)
    const [bannerFile, setBannerFile] = useState<File | undefined>(undefined);
    const [profileFile, setProfileFile] = useState<File | undefined>(undefined);

    // Sync state with Redux user on load/cancel
    useEffect(() => {
        if (!isEditing && user) {
            setUsername(user.username);
            setBio(user.bio || '');
            setSocials(user.socials || []);
            setBannerPreview(user.banner?.highRes?.url || '');
            setProfilePreview(user.profilePic?.highRes?.url || '');
        }
    }, [isEditing, user]);

    // --- Handlers ---

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>, type: 'banner' | 'profile') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            
            if (type === 'banner') {
                setBannerFile(file);
                setBannerPreview(previewUrl);
            } else {
                setProfileFile(file);
                setProfilePreview(previewUrl);
            }
        }
    };

    const handleAddSocial = () => {
        setSocials([...socials, { platform: 'Website', url: '' }]);
    };

    const handleRemoveSocial = (index: number) => {
        setSocials(socials.filter((_, i) => i !== index));
    };

    const handleSocialChange = (index: number, field: keyof SocialItem, value: string) => {
        const newSocials = [...socials];
        newSocials[index] = { ...newSocials[index], [field]: value };
        setSocials(newSocials);
    };

    const handleSave = async () => {
        // Basic Validation
        if (!username.trim()) return alert("Username is required");

        const result = await dispatch(updateProfile({
            username,
            bio,
            socials,
            profilePic: profileFile,
            banner: bannerFile
        }));

        if (updateProfile.fulfilled.match(result)) {
            setIsEditing(false);
        }
    };

    // --- Renderers ---

    if (!user) return <Typography>Loading Profile...</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    position: 'relative',
                    bgcolor: 'background.paper'
                }}
            >
                {/* Banner Section */}
                <Box 
                    sx={{ 
                        height: 200, 
                        bgcolor: 'grey.300',
                        backgroundImage: `url(${bannerPreview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                    }}
                >
                    {isEditing && (
                        <Box sx={{ 
                            position: 'absolute', 
                            inset: 0, 
                            bgcolor: 'rgba(0,0,0,0.4)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Button 
                                variant="contained" 
                                component="label" 
                                startIcon={<CameraIcon />}
                                size="small"
                            >
                                Edit Banner
                                <input hidden accept="image/*" type="file" onChange={(e) => handleImageChange(e, 'banner')} />
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Main Content Area */}
                <Box sx={{ px: 4, pb: 4, mt: -6 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2 }}>
                        {/* Profile Picture */}
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={profilePreview || undefined}
                                alt={username}
                                sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    border: '4px solid',
                                    borderColor: 'background.paper',
                                    boxShadow: 2
                                }}
                            >
                                {!profilePreview && username[0]?.toUpperCase()}
                            </Avatar>
                            {isEditing && (
                                <IconButton 
                                    component="label"
                                    sx={{ 
                                        position: 'absolute', 
                                        bottom: 0, 
                                        right: 0, 
                                        bgcolor: 'primary.main', 
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <CameraIcon fontSize="small" />
                                    <input hidden accept="image/*" type="file" onChange={(e) => handleImageChange(e, 'profile')} />
                                </IconButton>
                            )}
                        </Box>

                        {/* Edit Actions */}
                        <Box sx={{ mb: 1 }}>
                            {isEditing ? (
                                <Stack direction="row" spacing={1}>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        startIcon={<CancelIcon />} 
                                        onClick={() => setIsEditing(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />} 
                                        onClick={handleSave}
                                        disabled={isLoading}
                                    >
                                        Save
                                    </Button>
                                </Stack>
                            ) : (
                                <Button 
                                    variant="outlined" 
                                    startIcon={<EditIcon />} 
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </Box>
                    </Stack>

                    {/* Info Section */}
                    <Box sx={{ mt: 2 }}>
                        {isEditing ? (
                            // --- EDIT MODE FORM ---
                            <Stack spacing={3} sx={{ mt: 2 }}>
                                <TextField
                                    label="Username"
                                    fullWidth
                                    variant="outlined"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    helperText="Unique identifier"
                                />
                                <TextField
                                    label="Bio"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    inputProps={{ maxLength: 100 }}
                                    helperText={`${bio.length}/100 characters`}
                                />
                                
                                <Typography variant="h6" sx={{ mt: 2 }}>Social Connections</Typography>
                                {socials.map((social, index) => (
                                    <Grid container spacing={2} key={index} alignItems="center">
                                        <Grid item xs={4} sm={3}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Platform</InputLabel>
                                                <Select
                                                    value={social.platform}
                                                    label="Platform"
                                                    onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                                                    renderValue={(value) => (
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            {getSocialIcon(value)} {value}
                                                        </Box>
                                                    )}
                                                >
                                                    {SOCIAL_PLATFORMS.map((p) => (
                                                        <MenuItem key={p} value={p}>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                {getSocialIcon(p)} {p}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6} sm={8}>
                                            <TextField 
                                                fullWidth 
                                                size="small" 
                                                placeholder="https://..."
                                                value={social.url}
                                                onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={2} sm={1}>
                                            <IconButton color="error" onClick={() => handleRemoveSocial(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button 
                                    startIcon={<AddIcon />} 
                                    variant="text" 
                                    onClick={handleAddSocial}
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    Add Social
                                </Button>
                            </Stack>
                        ) : (
                            // --- VIEW MODE ---
                            <>
                                <Typography variant="h5" fontWeight="bold">
                                    {user.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {user.email} {user.auth.isEmailVerified && "✅"}
                                </Typography>
                                
                                {user.bio && (
                                    <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                                        {user.bio}
                                    </Typography>
                                )}

                                {/* Stats Grid */}
                                <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                    <Grid item xs={3} textAlign="center">
                                        <Typography variant="h6" fontWeight="bold">{user.followersCount}</Typography>
                                        <Typography variant="caption" color="text.secondary">Followers</Typography>
                                    </Grid>
                                    <Grid item xs={3} textAlign="center">
                                        <Typography variant="h6" fontWeight="bold">{user.followingCount}</Typography>
                                        <Typography variant="caption" color="text.secondary">Following</Typography>
                                    </Grid>
                                    <Grid item xs={3} textAlign="center">
                                        <Typography variant="h6" fontWeight="bold">{user.subspacesJoinedCount}</Typography>
                                        <Typography variant="caption" color="text.secondary">Joined</Typography>
                                    </Grid>
                                    <Grid item xs={3} textAlign="center">
                                        <Typography variant="h6" fontWeight="bold">{user.postsCount}</Typography>
                                        <Typography variant="caption" color="text.secondary">Posts</Typography>
                                    </Grid>
                                </Grid>

                                <Stack direction="row" spacing={1}>
                                    {user.socials && user.socials.map((social, idx) => (
                                        <SocialLink key={idx} {...social} />
                                    ))}
                                </Stack>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default UserProfile;
Key Features of this Implementation:
Architecture Compliance: It uses your user.reducer, profile.user.thunk, and profile.user.reducer structures. It dispatches a strongly typed AsyncThunk that returns a UserClientBase.

Sleek Styling (MUI):

Uses a "Banner + Avatar overlap" layout common in modern social apps (like Twitter/Discord).

Uses Stack and Grid for layout consistency.

Visual feedback for "Edit" mode with hover overlays on images.

In-Place Editing:

No modals. The isEditing boolean toggles the internal render logic of the main content area.

Image Previews: Using URL.createObjectURL allows the user to see what the new banner/avatar looks like instantly before uploading.

Socials Management:

Dynamic array management (Add/Remove rows).

A Selector for the platform (renders the specific Icon in the dropdown).

Maps to the specific Icons you requested (Twitter, Reddit, etc.) and falls back to a generic web icon.

Validation:

Includes basic validation (checking if username is empty).

Limits Bio length to 100 characters (matching your schema).


-----

Here is the complete server-side implementation.

I have included the Controller logic to handle the text and file inputs, and the Route configuration to handle the multipart/form-data with Multer fields.

1. Update profile.user.controller.ts
Add the updateProfile function. This handles parsing the JSON socials, checking for username uniqueness, and mapping the Multer diskStorage file objects to your User schema structure.

TypeScript

import {
    ApiError,
    ApiResponse,
    validateAll,
    validateCurrentPassword,
    validateNewPassword,
} from '@syncspace/shared';
// importing config
import { UPDATE_EMAIL_EXPIRY, VERIFY_EMAIL_EXPIRY } from '../../config/env.config.js';
// importing types
import type { UserDocument } from '@syncspace/shared';
import type { Request } from 'express';
// importing models
import { User } from '../../models/user.model.js';
// importing libs
import { validateToken } from '../../lib/jwt.lib.js';
import { getEmail, getEmailLink, sendMail } from '../../lib/nodemailer.lib.js';
// importing service
import { validateNewEmail, getUserState } from '../../services/user.service.js';
// importing utils
import { asyncReqHandler } from '../../utils/asyncReqHandler.util.js';
import { validateReqBody } from '../../utils/validateReq.util.js';
// importing responses 
import {
    ProfileUserControllerResponses as responses,
    getProfileUserControllerResponse as getResponses,
} from '../../responses/index.js';

// ... (Existing exports: initiateEmailVerification, verifyEmail, etc.)

export const updateProfile = asyncReqHandler(async (req: Request) => {
    const { updateProfile: profileRes } = responses;
    
    // 1. Validate Body
    const body = validateReqBody(req);
    const { username, bio, socials } = body;

    const user = req.user as UserDocument;

    // 2. Prepare Update Object
    const updateData: any = {};

    // 3. Handle Username Update (Check uniqueness)
    if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new ApiError(profileRes.usernameTaken || { code: 409, message: "Username already taken" });
        }
        updateData.username = username;
    }

    // 4. Handle Simple Text Fields
    if (typeof bio === 'string') {
        updateData.bio = bio;
    }

    // 5. Handle Socials (Parsing JSON string from FormData)
    if (socials) {
        try {
            // FormData sends arrays/objects as JSON strings
            const parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
            if (Array.isArray(parsedSocials)) {
                updateData.socials = parsedSocials;
            }
        } catch (error) {
            throw new ApiError({ code: 400, message: "Invalid socials format" });
        }
    }

    // 6. Handle Files (Multer DiskStorage)
    // req.files is an object like: { profilePic: [File], banner: [File] }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
        // Helper to format Multer file to your fileSchema
        const formatFile = (file: Express.Multer.File) => ({
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            // Assuming diskStorage: constructing a public URL 
            // You might need to adjust the path based on your static file serving setup
            url: `/uploads/${file.filename}`, 
        });

        if (files.profilePic?.[0]) {
            // Updating highRes. Logic for lowRes/thumbnail generation can be added here if using sharp
            updateData['profilePic.highRes'] = formatFile(files.profilePic[0]);
        }

        if (files.banner?.[0]) {
            updateData['banner.highRes'] = formatFile(files.banner[0]);
        }
    }

    // 7. Execute Update
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        throw new ApiError(profileRes.updateFailed || { code: 500, message: "Failed to update profile" });
    }

    // 8. Return Sanitized User
    return new ApiResponse(
        profileRes.success || { code: 200, message: "Profile updated successfully" },
        getUserState(updatedUser)
    );
});
2. Update user.routes.ts
We need to configure the specific Multer middleware for this route since the generic fileUploadHandler in your provided files is optimized for single-field uploads.

TypeScript

import { Router } from 'express';
// importing middlewares
import { auth } from '../middlewares/auth.middleware.js';
import { requireReauth } from '../middlewares/requireReauth.middleware.js';
import { configureMulter, configureMulterErrorHandler } from '../middlewares/multer.middleware.js'; // Assumed export based on context
// importing controllers
import {
    deleteAccount,
    resetSetting,
    updateSetting,
} from '../controllers/user/account.user.controller.js';
import {
    changePassword,
    initiateEmailUpdation,
    initiateEmailVerification,
    updateEmail,
    verifyEmail,
    updateProfile, // Import the new controller
} from '../controllers/user/profile.user.controller.js';
import {
    determineReauth,
    fetchSession,
} from '../controllers/user/session.user.controller.js';

const router = Router();

// GET
router.get('/fetchSession', auth, fetchSession);
router.get('/determineReauth', auth, requireReauth, determineReauth);

// POST
router.post('/initiateEmailVerification', auth, requireReauth, initiateEmailVerification);
router.post('/initiateEmailUpdation', auth, requireReauth, initiateEmailUpdation);

// PATCH
router.patch('/verifyEmail', verifyEmail);
router.patch('/updateEmail', updateEmail);
router.patch('/updateSetting', auth, updateSetting);
router.patch('/resetSetting', auth, resetSetting);
router.patch('/changePassword', auth, requireReauth, changePassword);

// --- NEW ROUTE FOR PROFILE UPDATE ---
// Configuring Multer specifically for profile update (Profile Pic + Banner)
const profileUpload = configureMulter({ 
    sizeLimitBytes: 5 * 1024 * 1024 // 5MB limit example
}).fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

const profileUploadErrorHandler = configureMulterErrorHandler({ 
    sizeLimitMB: 5, 
    fieldName: 'profilePic/banner' 
});

router.patch(
    '/updateProfile', 
    auth, 
    profileUpload, 
    profileUploadErrorHandler, 
    updateProfile
);

// DELETE
router.delete('/deleteAccount', auth, requireReauth, deleteAccount);

export default router;
3. Note on responses/index.js
The code above assumes responses contains messages for updateProfile. If not, ensure you add them to your response configuration file:

TypeScript

// Inside ProfileUserControllerResponses
updateProfile: {
    success: { code: 200, message: 'Profile updated successfully' },
    usernameTaken: { code: 409, message: 'This username is already taken' },
    updateFailed: { code: 500, message: 'Failed to update profile' }
}