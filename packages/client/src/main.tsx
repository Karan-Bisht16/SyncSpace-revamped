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