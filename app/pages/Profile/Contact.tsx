import Colors from '@/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    // Handle form submission here
    console.log({ name, email, message });
    alert('Thank you for your message! We will get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.BLACK} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Get in Touch</Text>
            <Text style={styles.subtitle}>We'd love to hear from you</Text>
          </View>
          <View></View>
        </View>

        <View style={styles.contactOptions}>
          <View style={styles.optionCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
              <Ionicons name="call" size={24} color="#1976d2" />
            </View>
            <Text style={styles.optionTitle}>Call Us</Text>
            <Text style={styles.optionText}>+91 1143587138</Text>
            <Text style={styles.optionText}>+91 8269233078</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => openLink('tel:+1143587138')}
            >
              <Text style={styles.optionButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="mail" size={24} color="#388e3c" />
            </View>
            <Text style={styles.optionTitle}>Email Us</Text>
            <Text style={styles.optionText}>youliteledlightingpvtltd@gmail.com</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => openLink('mailto:youliteledlightingpvtltd@gmail.com')}
            >
              <Text style={styles.optionButtonText}>Send Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
              <Ionicons name="location" size={24} color="#f57c00" />
            </View>
            <Text style={styles.optionTitle}>Visit Us</Text>
            <Text style={styles.optionText}>Plot No. 17, First Floor, DLF Industrial Area,</Text>
            <Text style={styles.optionText}>Moti Nagar, New Delhi - 110015, India</Text>
          </View>
        </View>

        <View style={styles.socialContainer}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink('https://www.facebook.com/share/1FQazZ99sA/')}
            >
              <Ionicons name="logo-facebook" size={28} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink('https://www.instagram.com/youlite_official?igsh=cHB5ZDV4ZWFndTRm')}
            >
              <Ionicons name="logo-instagram" size={28} color="#e1306c" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink('https://youtube.com/@youliteofficial?si=Nx-ibad76bHQRJXc')}
            >
              <Ionicons name="logo-youtube" size={28} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink('https://wa.me/1143587138')}
            >
              <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'none',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  contactOptions: {
    padding: 16,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  optionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  socialContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    marginHorizontal: 12,
  },
});

export default Contact;



