import imagePath from '@/constant/imagePath';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    Splash: undefined;
    Slider: undefined;
};

const Index = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        if (!showSplash) return;

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        // Continuous breathe animation (zoom in/out)
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05, // Zoom in
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.95, // Zoom out
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Navigate after delay
        const timer = setTimeout(() => {
            setShowSplash(false);
            navigation.replace('Slider');
        }, 2500);

        return () => {
            clearTimeout(timer);
            scaleAnim.setValue(0.8);
            fadeAnim.setValue(0);
        };
    }, [showSplash, scaleAnim, fadeAnim, navigation]);

    if (!showSplash) {
        return null;
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden backgroundColor="#FFFFFF" barStyle="dark-content" />
            <Animated.View style={[
                styles.logoContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <Image
                    source={imagePath.SplashScreen}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 9999,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
    },
});

export default Index;

