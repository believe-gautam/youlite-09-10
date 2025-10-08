import imagePath from "@/constant/imagePath";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Dimensions, StatusBar, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function App() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/Slider");
        }, 6000); // 6 sec baad Slider page par redirect

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <Image
                source={imagePath.splashGif} // apna gif path (assets me hona chahiye)
                style={styles.gif}
                contentFit="cover" // gif ko screen me cover kar dega
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    gif: {
        width: width,  
        height: height, 
    },
});
