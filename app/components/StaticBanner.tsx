import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const bannerData = [
  {
    id: '1',
    image: require('@/assets/images/product-img1.webp'),
    title: 'Apple Book',
    description: "Don't miss the last opportunity.",
  },
  {
    id: '2',
    image: require('@/assets/images/product-img2.webp'),
    title: 'Smartwatches',
    description: "Don't miss the last opportunity.",
  },
  {
    id: '3',
    image: require('@/assets/images/product-img3.webp'),
    title: 'SmartTV',
    description: "Don't miss the last opportunity.",
  },
];

// Duplicate list for infinite effect
const loopData = [...bannerData, ...bannerData];

const ITEM_WIDTH = width;

const StaticBanner: React.FC = () => {
  const flatListRef = useRef<FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // In React Native, timers are numbers
  const timerRef = useRef<number | null>(null);

  const navigateToList = () => {
    router.push('/pages/LIstPage/AllProductsScreen');
  };

  // Auto-scroll every 2.5s with guard
  useEffect(() => {
    // clear any previous
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // set new interval
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % loopData.length;
        try {
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        } catch {
          flatListRef.current?.scrollToOffset({ offset: nextIndex * ITEM_WIDTH, animated: true });
        }
        return nextIndex;
      });
    }, 2500) as unknown as number;

    // cleanup
    return () => {
      if (timerRef.current != null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Track scroll
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setCurrentIndex(index);
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={loopData}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={navigateToList}>
            <ImageBackground source={item.image} style={styles.bannerImage} imageStyle={{ borderRadius: 0 }}>
              {/* Overlay content */}
              <View style={styles.contentBox}>
                <Text
                  style={[
                    styles.title,
                    item.id === '2' && { color: '#000' }, // contrast tweak for slide 2
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.description,
                    item.id === '2' && { color: '#363636ff' },
                  ]}
                >
                  {item.description}
                </Text>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Shop Now</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />

      {/* Dots Indicator */}
      <View style={styles.dotContainer}>
        {bannerData.map((_, index) => {
          const isActive = currentIndex % bannerData.length === index;
          return <View key={`dot_${index}`} style={[styles.dot, isActive && styles.activeDot]} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerImage: {
    width: ITEM_WIDTH,
    height: 220,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  contentBox: {
    width: '55%',
    padding: 15,
    borderRadius: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#f2f2f2',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
    width: 16,
  },
});

export default StaticBanner;
