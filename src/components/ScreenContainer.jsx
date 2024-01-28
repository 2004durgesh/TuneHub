import React from 'react';
import { SafeAreaView ,View} from 'react-native';
import { FAB } from 'react-native-paper';
import tw from 'twrnc';
import { useTheme } from 'react-native-paper';

const ScreenContainer = ({ children }) => {
    const theme = useTheme();
    return (
        <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.primary }]}>
            {children}
        </SafeAreaView>
    );
};

export default ScreenContainer;
