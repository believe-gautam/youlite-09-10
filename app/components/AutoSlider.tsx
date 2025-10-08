import imagePath from "@/constant/imagePath";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    ImageBackground,
    ListRenderItemInfo,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

type Slide = {
    id: string;
    image: any;
    brand: string;
    title: string;
    subtitle: string;
    offer: string;
};

const originalSlides: Slide[] = [
    { id: "1", image: imagePath.skin10, brand: "ROADSTER", title: "Casual Vibes", subtitle: "New Collection", offer: "Min 50% OFF" },
    { id: "2", image: imagePath.skin9, brand: "TOKYO TALKIES", title: "Go For The Trend", subtitle: "Be bold, be ahead", offer: "Under ₹399 + Free Shipping" },
   
];

// Create extended data for infinite scroll
const slides: Slide[] = [
    { ...originalSlides[originalSlides.length - 1], id: "last-clone" }, // Clone of last item at beginning
    ...originalSlides,
    { ...originalSlides[0], id: "first-clone" }, // Clone of first item at end
];

const AutoSlider = () => {
    const flatListRef = useRef<FlatList<Slide>>(null);
    const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 because of the cloned first item
    const scrollX = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isScrolling = useRef(false);

    // Handle scroll end to create infinite loop
    const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffset = e.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffset / width);

        // If at the clone of last item (beginning), jump to the real last item
        if (newIndex === 0) {
            flatListRef.current?.scrollToOffset({
                offset: width * originalSlides.length,
                animated: false,
            });
            setCurrentIndex(originalSlides.length);
        }
        // If at the clone of first item (end), jump to the real first item
        else if (newIndex === slides.length - 1) {
            flatListRef.current?.scrollToOffset({
                offset: width,
                animated: false,
            });
            setCurrentIndex(1);
        }
        // Normal case
        else {
            setCurrentIndex(newIndex);
        }

        isScrolling.current = false;
    };

    // Scroll listener
    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    // Auto-scroll effect
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            if (!isScrolling.current) {
                isScrolling.current = true;
                const nextIndex = (currentIndex + 1) % slides.length;

                // If we're about to scroll to the cloned first item at the end
                if (nextIndex === slides.length - 1) {
                    flatListRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true
                    });
                }
                // Normal scroll
                else {
                    flatListRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true
                    });
                }

                // Update current index (handling the wrap-around)
                setCurrentIndex(nextIndex === slides.length - 1 ? 1 : nextIndex);
            }
        }, 3000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentIndex]);

    // Initial scroll to the first real item (index 1)
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({
                offset: width,
                animated: false,
            });
        }, 100);
    }, []);

    // Render slide
    const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
        <TouchableOpacity onPress={() => router.push('/pages/LIstPage/AllProductsScreen')} style={{ width }}>
            <ImageBackground
                source={item.image}
                style={styles.slide}
                imageStyle={{ borderRadius: 12 }}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    {/* <Text style={styles.brand}>{item.brand}</Text>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                    <Text style={styles.offer}>{item.offer}</Text> */}
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    // Get the real index for dots (0 to originalSlides.length - 1)
    const getRealIndex = (index: number): number => {
        if (index === 0) return originalSlides.length - 1;
        if (index === slides.length - 1) return 0;
        return index - 1;
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
                onScroll={onScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                initialScrollIndex={1}
            />

            {/* dots - only show for original slides */}
            <View style={styles.dotsContainer}>
                {originalSlides.map((_, i) => (
                    <View
                        key={i}
                        // style={[styles.dot, getRealIndex(currentIndex) === i && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );
};

export default AutoSlider;

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
    },
    slide: {
        height: 235,
        marginHorizontal: 10,
        borderRadius: 12,
        overflow: "hidden",
        justifyContent: "flex-end",
        padding: 16,
    },
    overlay: {
        position: "absolute",
        bottom: 30,
        left: 20,
    },
    brand: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    subtitle: {
        fontSize: 14,
        color: "#eee",
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    offer: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ffeb3b",
        marginTop: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 4,
        backgroundColor: "#ccc",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: "#000",
        width: 6,
        height: 6,
    },
});