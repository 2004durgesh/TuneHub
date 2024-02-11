import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { FAB } from 'react-native-paper';
import tw from 'twrnc';
import { useTheme } from 'react-native-paper';
import ControlFooter from './ControlFooter';
import { useControlFooter } from '../context/ControlFooterContext';
const ScreenContainer = ({ children }) => {
    const theme = useTheme();
    const { hideFooter } = useControlFooter();
    return (<>
        <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.primary }]}>
            {children}
        </SafeAreaView>
        {hideFooter ? null : <ControlFooter />}
    </>

    );
};

export default ScreenContainer;
