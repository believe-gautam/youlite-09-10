import React from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import AutoSlider from '../components/AutoSlider';
import Category from '../components/ProductCategory';
// import CategoryTabs from '../components/CategoryTabs';
import HiddenGems from '../components/Featured';
import Header from '../components/Header';
import Latest from '../components/Latest';
import MainCard from '../components/Offer';
import PeopleAlsoViewed from '../components/PeopleViews';
import StaticBanner from '../components/StaticBanner';

const Home = () => {
  return (
    <View style={{ flex: 1, padding: 0, backgroundColor: '#fff' }}>
      {/* Status Bar */}
      <StatusBar backgroundColor='transparent' barStyle="light-content" translucent={true} />
      <Header />
      {/* <CategoryTabs /> */}
      <ScrollView>
        <MainCard />
        <Category />
        <AutoSlider />
        <HiddenGems />
        <StaticBanner />
        {/* <View style={{width:'100%', height:220,marginBottom:20}}>
        <Image
          source={imagePath.skin5}
          style={{width:'100%', height:'100%', objectFit:'fill'}}
        />
        </View> */}
        <Latest />

        <PeopleAlsoViewed />
      </ScrollView>
    </View>
  );
};

export default Home;

