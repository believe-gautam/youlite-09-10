import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Define types for our data structures
type Question = {
    id: number;
    question: string;
    answer: string;
};

type HelpTopic = {
    id: number;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    questions: Question[];
};

type ContactOption = {
    id: number;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
};

type ExpandedSections = {
    [key: number]: boolean;
};

const Help = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});

    const toggleSection = (section: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const helpTopics: HelpTopic[] = [
        {
            id: 1,
            title: 'Order Issues',
            icon: 'cart',
            questions: [
                { id: 1, question: 'How to track my order?', answer: 'You can track your order from the "My Orders" section in the app. We\'ll also send you regular updates via email and push notifications.' },
                { id: 2, question: 'How to cancel an order?', answer: 'Orders can be cancelled within 1 hour of placement from the "My Orders" section. After that, please contact customer support for assistance.' },
                { id: 3, question: 'My order hasn\'t arrived', answer: 'Check the tracking information first. If the estimated delivery date has passed, please contact us with your order number for assistance.' }
            ]
        },
        {
            id: 2,
            title: 'Payment & Pricing',
            icon: 'card',
            questions: [
                { id: 1, question: 'What payment methods do you accept?', answer: 'We accept credit/debit cards, PayPal, Apple Pay, Google Pay, and select buy-now-pay-later services.' },
                { id: 2, question: 'Why was my payment declined?', answer: 'Payment declines can happen for various reasons: insufficient funds, incorrect card information, or your bank\'s security measures. Please verify your details or try another payment method.' }
            ]
        },
        {
            id: 3,
            title: 'Returns & Refunds',
            icon: 'refresh-circle',
            questions: [
                { id: 1, question: 'What is your return policy?', answer: 'We offer a 30-day return policy for most items. Items must be unused and in original packaging with tags attached. Some items like personal care products may not be returnable for hygiene reasons.' },
                { id: 2, question: 'How long do refunds take?', answer: 'Once we receive your return, processing takes 3-5 business days. The time for the refund to appear in your account depends on your payment method and bank (typically 5-10 business days).' }
            ]
        },
        {
            id: 4,
            title: 'Account & Security',
            icon: 'lock-closed',
            questions: [
                { id: 1, question: 'How to reset my password?', answer: 'Go to the login screen and tap "Forgot Password". Enter your email address and we\'ll send you a link to reset your password.' },
                { id: 2, question: 'How to update my account information?', answer: 'You can update your personal information from the "Account" section in the app. Tap on your profile picture to access these settings.' }
            ]
        },
        {
            id: 5,
            title: 'Shipping Information',
            icon: 'boat',
            questions: [
                { id: 1, question: 'What are your shipping options?', answer: 'We offer standard (3-5 business days), express (2-3 business days), and next-day delivery (where available). Shipping costs vary based on the option selected.' },
                { id: 2, question: 'Do you ship internationally?', answer: 'Yes, we ship to over 50 countries. International shipping times vary from 7-14 business days depending on the destination.' }
            ]
        }
    ];

    const contactOptions: ContactOption[] = [
        { id: 1, title: 'Live Chat', icon: 'chatbubbles', description: 'Chat with our support team 24/7' },
        { id: 2, title: 'Email Us', icon: 'mail', description: 'Get a response within 24 hours' },
        { id: 3, title: 'Call Support', icon: 'call', description: 'Mon-Fri, 9AM-6PM (your local time)' }
    ];

    return (
        <View style={styles.container}>
            {/* Header matching the ProfileScreen style */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
                <TouchableOpacity onPress={() => router.push('/pages/Setting/Setting')}>
                    <Ionicons name="settings-outline" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <Text style={styles.sectionTitle}>Popular Topics</Text>

                {helpTopics.map(topic => (
                    <View key={topic.id} style={styles.topicCard}>
                        <View style={styles.topicHeader}>
                            <Ionicons name={topic.icon} size={22} color={Colors.PRIMARY} />
                            <TouchableOpacity
                                style={styles.expandButton}
                                onPress={() => toggleSection(topic.id)}
                            >
                                <Text style={styles.topicTitle}>{topic.title}</Text>
                                <Ionicons
                                    name={expandedSections[topic.id] ? 'chevron-up' : 'chevron-down'}
                                    size={22}
                                    color="#4a6da7"
                                />
                            </TouchableOpacity>
                        </View>

                        {expandedSections[topic.id] && (
                            <View style={styles.questionsContainer}>
                                {topic.questions.map(item => (
                                    <TouchableOpacity key={item.id} style={styles.questionItem}>
                                        <Text style={styles.questionText}>{item.question}</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#999" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Contact Support</Text>
                <View style={styles.contactContainer}>
                    {contactOptions.map(option => (
                        <TouchableOpacity key={option.id} style={styles.contactOption}>
                            <View style={styles.contactIconContainer}>
                                <Ionicons name={option.icon} size={24} color="#fff" />
                            </View>
                            <Text style={styles.contactTitle}>{option.title}</Text>
                            <Text style={styles.contactDescription}>{option.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>FAQ</Text>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I apply a discount code?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>What should I do if I receive a damaged item?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>How do I create a wishlist?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>Can I change my delivery address after ordering?</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
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
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.WHITE,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginVertical: 20,
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 25,
        marginBottom: 15,
        color: '#1a1a1a',
    },
    topicCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    topicHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        flex: 1,
        color: '#1a1a1a',
    },
    expandButton: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingRight: 20
    },
    questionsContainer: {
        marginTop: 15,
    },
    questionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    questionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        paddingRight: 10,
    },
    contactContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    contactOption: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        width: '30%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    contactIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: Colors.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    contactTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 5,
    },
    contactDescription: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    faqSection: {
        marginBottom: 30,
    },
    faqItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    faqQuestion: {
        fontSize: 16,
        color: '#333',
    },
});

export default Help;

