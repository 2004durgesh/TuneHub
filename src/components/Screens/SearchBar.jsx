import { View, Text, TouchableOpacity,Keyboard } from 'react-native';
import React, { useState } from 'react';
import tw from 'twrnc';
import { Searchbar, useTheme } from 'react-native-paper';
import ScreenContainer from '../ScreenContainer';
import { useSearch } from '../../context/SearchContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../Loading';

const SearchBar = ({ navigation }) => {
  const { isLoading, setSearchQuery, searchSuggestions, getSearches, getSearchSuggestions } = useSearch();
  const [inputValue, setInputValue] = useState('');
  const handleSearch = async () => {
    Keyboard.dismiss();
    setSearchQuery(inputValue);
    await getSearches(inputValue);
    navigation.navigate('Musics')
  };
  const handleChangeText = async (text) => {
    setInputValue(text);
    await getSearchSuggestions(text);
  };
  return (
    <>
      <ScreenContainer>
        <Searchbar
          placeholder="Search for music, albums, or playlists"
          onChangeText={handleChangeText}
          value={inputValue}
          style={tw`m-4`}
          onSubmitEditing={handleSearch}
        />
        {isLoading ? <Loading /> : (searchSuggestions?.map((suggestion,index) => (
          <TouchableOpacity onPress={handleSearch} key={index}>
            <View key={suggestion} style={tw`p-4 flex-row items-center justify-between`}>
              <Text style={tw`capitalize text-white font-bold text-lg`}>{suggestion}</Text>
              <MaterialCommunityIcons
                name="arrow-top-left"
                size={20}
                color={'white'}
                onPress={() => setInputValue(suggestion)}
              />
            </View>
          </TouchableOpacity>
        )))}
      </ScreenContainer>
    </>
  );
};

export default SearchBar;
