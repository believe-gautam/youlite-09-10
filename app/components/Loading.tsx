import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import imagePath from '@/constant/imagePath'; // Make sure this path is correct

const Loading: React.FC = () => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(translateY, {
                    toValue: -15, // move up
                    duration: 500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0, // move back down
                    duration: 500,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();

        return () => animation.stop();
    }, [translateY]);

    return (
        <View style={styles.loader}>
            <Animated.View style={{ transform: [{ translateY }] }}>
                <Image
                    source={imagePath.loader}
                    style={styles.loaderImage}
                />
            </Animated.View>
        </View>
    );
};

export default Loading;

const styles = StyleSheet.create({
    loader: {
        padding: 16,
    },
    loaderImage: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 16,
        color: '#333',
    },
});
