import Colors from '@/utils/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { loadCategories } from '@/lib/services/categoryService';

type Category = {
  id: string;
  name: string;
  image?: { src?: string | null } | null;
};

const ProCategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const raw: any = await loadCategories();

        let list: any = raw;
        if (raw && typeof raw === 'object') {
          if (Array.isArray(raw.data)) list = raw.data;
          else if (Array.isArray(raw.categories)) list = raw.categories;
          else if (Array.isArray(raw.items)) list = raw.items;
        }
        if (!Array.isArray(list)) {
          const edges = raw?.data?.collections?.edges || raw?.collections?.edges;
          if (Array.isArray(edges)) list = edges.map((e: any) => e?.node).filter(Boolean);
        }

        const arr: any[] = Array.isArray(list) ? list : [];
        const normalized: Category[] = arr.map((c: any, idx: number) => {
          const id =
            c?.id ??
            c?.term_id ??
            c?._id ??
            c?.uuid ??
            `idx-${idx}`;

          const name =
            c?.name ??
            c?.title ??
            c?.label ??
            'Unnamed';

          const imageSrc =
            c?.image?.src ??
            c?.image?.url ??
            c?.imageUrl ??
            c?.featured_image?.src ??
            c?.media?.src ??
            c?.thumbnail?.src ??
            null;

          return {
            id: String(id),
            name: String(name),
            image: imageSrc ? { src: imageSrc } : null,
          };
        });

        setCategories(normalized);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Product Categories</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/Category')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      {(!categories || categories.length === 0) ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <Text style={{ color: Colors.CATEGORY }}>No categories found.</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, idx) => item?.id || String(idx)}
          horizontal
          contentContainerStyle={{ paddingRight: 16 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const imgSrc = item?.image?.src ?? null;
            return (
              <TouchableOpacity
                style={styles.categoryItem}
                onPress={() =>
                  router.push({
                    pathname: '/pages/AllCategory/CategoryProduct',
                    params: {
                      title: item.name,
                      id: String(item.id),
                      image: imgSrc ?? ''
                    },
                  })
                }
              >
                <View style={styles.iconWrapper}>
                  {imgSrc ? (
                    <Image
                      source={{ uri: imgSrc }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="shape"
                      size={28}
                      color={Colors.PRIMARY}
                    />
                  )}
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default ProCategory;

const styles = StyleSheet.create({
  container: { marginTop: 0, paddingHorizontal: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryImage: { width: 40, height: 40, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.SECONDARY },
  viewAll: { fontSize: 14, color: Colors.PRIMARY, fontWeight: '600' },
  categoryItem: { alignItems: 'center', marginRight: 2, width: 90 },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryName: { fontSize: 12, fontWeight: '500', color: Colors.CATEGORY, textAlign: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
});
