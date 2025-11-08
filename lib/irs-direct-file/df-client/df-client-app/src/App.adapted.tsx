/**
 * Adapted version of IRS Direct File App for integration with Financbase
 * 
 * This version replaces BrowserRouter with MemoryRouter to work within Next.js
 * and isolates the Direct File app from Financbase's routing.
 * 
 * Original source: App.tsx from IRS Direct File repository
 * License: CC0 1.0 Universal (Public Domain)
 */

import { Navigate, Route, MemoryRouter as Router, Routes, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Head from './components/Head/Head.js';
import NotFound from './pages/NotFound.js';
import NotPermitted from './pages/NotPermitted.js';
import AccessLimited from './pages/AccessLimited.js';
import Account from './auth/Account/Account.js';
import useNetworkConnectionStatus from './hooks/useNetworkConnectionStatus.js';
import { NetworkConnectionContext } from './context/networkConnectionContext.js';
import { Suspense } from 'react';
import { About } from './pages/About.js';
import AuthorizeStateScreen from './screens/AuthorizeStateScreen/AuthorizeStateScreen.js';
import LoadingIndicator from './components/LoadingIndicator/LoadingIndicator.js';
import TaxReturnIntro from './components/TaxReturnIntro/TaxReturnIntro.js';
import ErrorBoundary from './utils/errorBoundary.js';
import { TaxReturnDetails } from './pages/TaxReturnDetails/TaxReturnDetails.js';
import { SubmissionStatusContextProvider } from './context/SubmissionStatusContext/SubmissionStatusContext.js';
import LoadingVerify from './pages/LoadingVerify.js';
import { v4 as uuidv4 } from 'uuid';
import ResetTaxReturns from './auth/Account/ResetTaxReturns.js';
import PreviewTaxReturns from './auth/Account/PreviewTaxReturns.js';
import { ScreenHeader } from './screens/ScreenHeader.js';
import { SystemAlertContextProvider } from './context/SystemAlertContext/SystemAlertContext.js';
import { TaxReturnsContextProvider } from './context/TaxReturnsContext.js';
import { Provider } from 'react-redux';

import BaseScreen from './screens/BaseScreen.js';
import Checklist from './screens/Checklist.js';
import { TaxProfileContextOrSpinnerGate } from './screens/TaxProfileContextOrSpinnerGate.js';
import DataView from './screens/DataView.js';
import CollectionItemDataView from './screens/data-view/CollectionItemDataView.js';
import GlobalLayout from './components/GlobalLayout.js';
import Home from './components/Home.js';
import { isFlowEnabled } from './constants/pageConstants.js';
import { store } from './redux/store.js';

// These styles are global so we make sure it is imported at the root
import '@trussworks/react-uswds/lib/index.css';
import FileYourStateTaxesDetails from './components/FileYourStateTaxesDetails/FileYourStateTaxesDetails.js';
import { FactGraphTranslationContext } from './context/FactGraphTranslationContext.js';
import { DataImportMagicScreen } from './components/DataImportMagicScreen/DataImportMagicScreen.js';

interface AdaptedAppProps {
	initialPath?: string;
	onExportComplete?: (metadata: { filename: string; exportDate: string; format: "mef-xml" | "json" }) => void;
}

const FlowEnabledRoutes = () => {
  return isFlowEnabled() ? <Outlet /> : <Navigate to='/access-limited' />;
};

export function DirectFileApp({ 
	initialPath = '/flow',
	onExportComplete,
}: AdaptedAppProps) {
  // Network connection hook polls for connectivity and results are passed
  // into the value of the NetworkConnectionContext.
  const INTERVAL_TIME = 4000;
  const initialNetworkState = { online: true, prevOnlineStatus: true };
  const networkConnectionValue = useNetworkConnectionStatus(initialNetworkState, INTERVAL_TIME);

  // Use empty basename for MemoryRouter (no public path needed)
  const baseRouterPath = '';

  if (import.meta.env.VITE_ALLOW_LOADING_TEST_DATA) {
    const searchParams = new URLSearchParams(window.location.search);
    const dummyEmail = searchParams.get(`testEmail`);
    if (dummyEmail) {
      sessionStorage.setItem(`email`, dummyEmail);
    }
    const generateNewUUID = searchParams.get(`generateUUID`);
    if (generateNewUUID) {
      const uuid = uuidv4();
      localStorage.setItem(`preauthUuid`, uuid);
    }
  }

  // Error boundary handler
  const handleError = (error: Error) => {
    console.error('Direct File App Error:', error);
    // Error handled by ErrorBoundary component
  };

  return (
    <NetworkConnectionContext.Provider value={networkConnectionValue}>
      <HelmetProvider>
        <Head />
        <Suspense fallback={<LoadingIndicator delayMS={0} />}>
          <Provider store={store}>
            <Router basename={baseRouterPath} initialEntries={[initialPath]}>
              <ErrorBoundary>
                <SystemAlertContextProvider>
                  <TaxReturnsContextProvider>
                    <SubmissionStatusContextProvider>
                      <Suspense fallback={<LoadingIndicator />}>
                        <GlobalLayout {...networkConnectionValue}>
                          <Suspense fallback={<LoadingIndicator />}>
                            <Routes>
                              <Route path='/' element={<Navigate to='/loading' replace />} />
                              <Route path='/es/' element={<Navigate to='/loading' replace />} />
                              <Route element={<FlowEnabledRoutes />}>
                                <Route
                                  path='/flow/*'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <BaseScreen />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/data-view/loop/:loopName/:collectionId/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <CollectionItemDataView />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/data-view/*'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <DataView />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/pre-checklist/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <Checklist />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/checklist/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <Checklist />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/home/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <Home />
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/tax-return-intro/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <TaxReturnIntro />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/authorize-state/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <AuthorizeStateScreen />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/file-your-state-taxes-details/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <FileYourStateTaxesDetails />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/data-import-magic/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <DataImportMagicScreen />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                                <Route
                                  path='/tax-return-details/:taxReturnId/'
                                  element={
                                    <TaxProfileContextOrSpinnerGate>
                                      <ScreenHeader />
                                      <main id='main' tabIndex={-1}>
                                        <TaxReturnDetails />
                                      </main>
                                    </TaxProfileContextOrSpinnerGate>
                                  }
                                />
                              </Route>
                              <Route path='/loading' element={<LoadingVerify />} />
                              <Route path='/loading-verify' element={<LoadingVerify />} />
                              <Route path='/access-limited' element={<AccessLimited />} />
                              <Route path='/not-permitted' element={<NotPermitted />} />
                              <Route path='/about' element={<About />} />
                              <Route path='/account' element={<Account />} />
                              <Route path='/account/reset-tax-returns' element={<ResetTaxReturns />} />
                              <Route path='/account/preview-tax-returns' element={<PreviewTaxReturns />} />
                              <Route path='*' element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </GlobalLayout>
                      </Suspense>
                    </SubmissionStatusContextProvider>
                  </TaxReturnsContextProvider>
                </SystemAlertContextProvider>
              </ErrorBoundary>
            </Router>
          </Provider>
        </Suspense>
      </HelmetProvider>
    </NetworkConnectionContext.Provider>
  );
}

