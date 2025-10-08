import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';

const Terms = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.subtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.paragraph}>
          Please read these terms and conditions carefully before using our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using our app, you approve that you have read, understood, and agree to be bound by these Terms.
        </Text>

        <Text style={styles.sectionTitle}>2. Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We respect your privacy and are committed to protecting your personal data. Our Privacy Policy explains how we collect, use, and share information about you.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times.
        </Text>

        <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The Service and its original content, features, and functionality are and will remain the exclusive property of our company and its licensors.
        </Text>

        <Text style={styles.sectionTitle}>5. Products and Pricing</Text>
        <Text style={styles.paragraph}>
          We reserve the right to change prices for products displayed in the app at any time, and to correct pricing errors that may inadvertently occur.
        </Text>

        <Text style={styles.sectionTitle}>6. Returns and Refunds</Text>
        <Text style={styles.paragraph}>
          Please review our return policy posted on the application prior to making any purchases. We cannot accept returns without a receipt or proof of purchase.
        </Text>

        <Text style={styles.sectionTitle}>7. Prohibited Uses</Text>
        <Text style={styles.paragraph}>
          You may not use the app for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.
        </Text>

        <Text style={styles.sectionTitle}>8. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion.
        </Text>

        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at support@ecommerceapp.com.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using our application, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: Dimenstion.headerHeight
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  footer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
  },
});

export default Terms;

