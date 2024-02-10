import { View, Text } from 'react-native'
import React,{useState,useEffect,Suspense} from 'react'
import ScreenContainer from '../../ScreenContainer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ItemListCards from '../../ItemListCards';

const Favorite = () => {
    const[favoriteData,setFavoriteData] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const storedData = await AsyncStorage.getItem('favoriteSongs');
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                console.log(parsedData,"favoriteData")
                setFavoriteData(parsedData);
            }
        };
        fetchData();
    }, []);
    return (
        <>
            <ScreenContainer>
                {favoriteData.length>0?<ItemListCards data={favoriteData} dataType="musics"/>:<Text>No favorite songs</Text>}
            </ScreenContainer>
        </>
    )
}

export default Favorite