import { View, Text, ScrollView, StatusBar } from 'react-native'
import React ,{useState} from 'react'
import tw from 'twrnc'
import { useSharedValue } from 'react-native-reanimated';


const AnimatedScrollView = ({children}) => {
    const [bgColor, setBgColor] = useState("transparent")
    const translateY = useSharedValue(0);
    const scrollHandler = (event) => {
        translateY.value = event.nativeEvent.contentOffset.y;
        if (translateY.value > 300) {
            setBgColor("black")
        } else {
            setBgColor("transparent")
        }
    }
    return (
        <>
            <StatusBar backgroundColor={bgColor} translucent animated />
            <ScrollView
                contentContainerStyle={tw`pb-20`}
                showsVerticalScrollIndicator={false}
                style={[tw`flex-1 bg-black`]}
                onScroll={scrollHandler}
            >
                {children}
            </ScrollView>
        </>
    )
}

export default AnimatedScrollView