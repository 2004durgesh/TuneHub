/**
 * @format
 */

import * as React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App.jsx';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SearchProvider } from './src/context/SearchContext.js';
import { SegmentedButtonProvider } from './src/context/SegmentedButtonContext.js';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './src/PlaybackService.js';
import { TrackPlayerProvider } from './src/context/TrackPlayerContext.js';
import { ControlFooterProvider } from './src/context/ControlFooterContext.js';
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1b1a1d',
    primaryContainer: '#272831',
    secondary: "#aec7ff",
    secondaryContainer: '#00409f',
  },
};
const queryClient = new QueryClient()
export default function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrackPlayerProvider>
        <ControlFooterProvider>
          <SearchProvider>
            <SegmentedButtonProvider>
              <PaperProvider theme={theme}>
                <App />
              </PaperProvider>
            </SegmentedButtonProvider>
          </SearchProvider>
        </ControlFooterProvider>
      </TrackPlayerProvider>
    </QueryClientProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
TrackPlayer.registerPlaybackService(() => PlaybackService)
