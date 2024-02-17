import { getColors } from 'react-native-image-colors'
import { useState, useEffect } from 'react'
export const useImageColors = (imageUrl) => {
    const [colors, setColors] = useState({})
    useEffect(() => {
        const url = imageUrl
        getColors(url, {
            fallback: "#000",
            cache: true,
            key: url,
        }).then(setColors);
    }, [imageUrl]);

    return colors
}



