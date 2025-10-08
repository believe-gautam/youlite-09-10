import Colors from '@/utils/Colors';
import axios from 'axios'; // Assuming Axios for API calls
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ImageItem = {
  id: string;
  url: string;
  alt: string;
  title: string;
};

const MainCard = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('https://youlitestore.in/wp-json/custom/v1/main-slider-data');
        
        // Extract and map images with generated IDs
        const fetchedImages: ImageItem[] = response.data.images.map((item: any, index: number) => ({
          id: `${index + 1}`,
          url: item.url,
          alt: item.alt,
          title: item.title,
        }));

        setImages(fetchedImages);
      } catch (err) {
        setError('Failed to fetch images');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const renderImage: ListRenderItem<ImageItem> = ({ item }) => (
    <TouchableOpacity onPress={() => router.push('/pages/LIstPage/AllProductsScreen')} style={styles.card}>
      <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.container}><Text>Loading images...</Text></View>;
  }

  if (error) {
    return <View style={styles.container}><Text>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
    <Text style={styles.sectionTitle}>Offers For You</Text>

      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

export default MainCard;

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    paddingHorizontal: 0,
  },
      sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.SECONDARY,
        marginBottom: 0,
        marginLeft: 10,
    },
  card: {
    width: 280,
    height: 135,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: Colors.WHITE,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
});
