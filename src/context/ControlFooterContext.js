import React, { createContext, useContext, useState } from 'react';

const ControlFooterContext = createContext();

export const ControlFooterProvider = ({ children }) => {

    const [imageUrl, setImageUrl] = useState('')
    const [songName,setSongName]=useState("")
    const[artistName,setArtistName]=useState("")
    const [youtubeId,setYoutubeId]=useState("")
    const [dataType,setDataType]=useState("")
    const [hideFooter, setHideFooter] = useState(false)

    return (
        <ControlFooterContext.Provider value={{ imageUrl,songName,setSongName,artistName,setArtistName, setImageUrl,youtubeId,setYoutubeId,dataType,setDataType,hideFooter, setHideFooter}}>
            {children}
        </ControlFooterContext.Provider>
    );
};

export const useControlFooter = () => {
    const context = useContext(ControlFooterContext);
    if (!context) {
        throw new Error('useControlFooter must be used within a ControlFooterProvider');
    }
    return context;
};
