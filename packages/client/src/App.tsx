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