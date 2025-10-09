import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const About = () => {
  const features = [
    {
      id: 1,
      icon: 'rocket',
      title: 'Fast Delivery',
      description: 'Get your orders delivered at your home',
    },
    {
      id: 2,
      icon: 'shield-checkmark',
      title: 'Secure Payments',
      description: 'Your payments are protected with bank-level security',
    },
    {
      id: 3,
      icon: 'leaf',
      title: 'Eco-Friendly',
      description: 'We use sustainable packaging and support green initiatives',
    },
    {
      id: 4,
      icon: 'headset',
      title: '24/7 Support',
      description: 'Our customer service team is always ready to help you',
    },
  ];

  const socialLinks = [
    {
      id: 1,
      name: 'Facebook',
      icon: 'logo-facebook',
      url: 'https://www.facebook.com/share/1FQazZ99sA/',
    },
    {
      id: 2,
      name: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://www.instagram.com/youlite_official?igsh=cHB5ZDV4ZWFndTRm',
    },
    {
      id: 3,
      name: 'Youtube',
      icon: 'logo-youtube',
      url: 'https://youtube.com/@youliteofficial?si=Nx-ibad76bHQRJXc',
    },
  ];

  const handleSocialLinkPress = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleContactPress = () => {
    const email = 'youliteledlightingpvtltd@gmail.com';
    const subject = 'Contact Us - Youlite';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(mailtoUrl).catch(err => console.error('Failed to open email client:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 24 }} /> {/* Spacer for balance */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Youlite</Text>
          <Text style={styles.heroSubtitle}>Redefining Online Shopping</Text>
          <Text style={styles.heroDescription}>
            Youlite has been committed to providing exceptional shopping experiences
            with quality products, competitive prices, and outstanding customer service.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500K+</Text>
            <Text style={styles.statLabel}>Happy Customers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>City</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us</Text>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={24} color={Colors.PRIMARY} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To make quality products accessible to everyone while maintaining the highest standards
            of customer service and environmental responsibility. We believe in creating value for
            our customers, employees, and the communities we serve.
          </Text>
        </View>


        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={styles.socialButton}
                onPress={() => handleSocialLinkPress(social.url)}
              >
                <Ionicons name={social.icon as any} size={24} color={Colors.PRIMARY} />
                <Text style={styles.socialText}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Button */}
        <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
          <Ionicons name="mail" size={20} color={Colors.WHITE} />
          <Text style={styles.contactButtonText}>Contact Us</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 Youlite. All rights reserved.</Text>
          <Text style={styles.footerVersion}>App Version 2.4.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    marginBottom: 24,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Dimenstion.headerHeight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroSection: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 24,
    marginVertical: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: Colors.WHITE,
    marginBottom: 16,
    opacity: 0.9,
  },
  heroDescription: {
    fontSize: 14,
    color: Colors.WHITE,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  missionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
  },
  teamContainer: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  teamMember: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 120,
  },
  teamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  socialButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    margin: 4,
    minWidth: 80,
  },
  socialText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  contactButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#999',
  },
});

export default About;