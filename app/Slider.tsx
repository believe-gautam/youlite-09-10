import imagePath from '@/constant/imagePath';
import { getSession } from '@/lib/services/authService';
import Colors from '@/utils/Colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const images = [imagePath.skin1, imagePath.skin2, imagePath.skin3, imagePath.skin4];

const Slider: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session?.user?.id) {
          router.replace('/(tabs)');
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const newIndex = Math.round(contentOffset.x / layoutMeasurement.width);
    setCurrentIndex(newIndex);
    setIsAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 10);
  };

  const navigateOnAction = async () => {
    try {
      const session = await getSession();
      if (session?.user?.id) {
        router.replace('/(tabs)');
      } else {
        router.push('/Login/LoginRegisterPage');
      }
    } catch {
      router.push('/Login/LoginRegisterPage');
    }
  };

  const onSkip = () => navigateOnAction();

  const onNext = () => {
    if (isAtEnd) {
      navigateOnAction();
      return;
    }
    const nextIndex = Math.min(currentIndex + 1, images.length - 1);
    scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar
        backgroundColor={Colors.PRIMARY}
        barStyle={'dark-content'} // Use 'light-content' if Colors.PRIMARY is dark
        translucent={false} // <--- Key for Android
      />
      <SafeAreaView style={styles.container}>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.85}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        {/* Image Slider */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={width}
          decelerationRate="fast"
          style={styles.scrollView}
        >
          {images.map((image, index) => (
            <View key={`slide_${index}`} style={styles.imageContainer}>
              <Image source={image} style={styles.image} contentFit="cover" transition={300} />
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={`dot_${index}`}
              style={[styles.paginationDot, currentIndex === index && styles.paginationDotActive]}
            />
          ))}
        </View>

        {/* Continue / Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={onNext} activeOpacity={0.9}>
          <Text style={styles.nextButtonText}>
            {isAtEnd ? 'Next' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width,
    height: height * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B0B0B0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.PRIMARY,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  nextButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 16,
    color: Colors.WHITE,
    fontWeight: '600',
  },
});

export default Slider;
