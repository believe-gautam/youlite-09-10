import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const Setting = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [promotionalEmails, setPromotionalEmails] = useState(false);
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [securityAlerts, setSecurityAlerts] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [biometricAuth, setBiometricAuth] = useState(true);
    const [savePaymentMethods, setSavePaymentMethods] = useState(true);

    const settingsSections = [
        {
            title: 'Preferences',
            icon: 'settings',
            items: [
                {
                    id: 1,
                    title: 'Notifications',
                    icon: 'notifications',
                    type: 'switch',
                    value: notificationsEnabled,
                    action: () => setNotificationsEnabled(!notificationsEnabled)
                },
                {
                    id: 2,
                    title: 'Promotional Emails',
                    icon: 'email',
                    type: 'switch',
                    value: promotionalEmails,
                    action: () => setPromotionalEmails(!promotionalEmails)
                },
                {
                    id: 3,
                    title: 'Order Updates',
                    icon: 'shopping-cart',
                    type: 'switch',
                    value: orderUpdates,
                    action: () => setOrderUpdates(!orderUpdates)
                },
                {
                    id: 4,
                    title: 'Security Alerts',
                    icon: 'security',
                    type: 'switch',
                    value: securityAlerts,
                    action: () => setSecurityAlerts(!securityAlerts)
                },
                // {
                //     id: 5,
                //     title: 'Dark Mode',
                //     icon: 'dark-mode',
                //     type: 'switch',
                //     value: darkMode,
                //     action: () => setDarkMode(!darkMode)
                // },
                {
                    id: 6,
                    title: 'Biometric Auth',
                    icon: 'fingerprint',
                    type: 'switch',
                    value: biometricAuth,
                    action: () => setBiometricAuth(!biometricAuth)
                },
                {
                    id: 7,
                    title: 'Save Payment Methods',
                    icon: 'payment',
                    type: 'switch',
                    value: savePaymentMethods,
                    action: () => setSavePaymentMethods(!savePaymentMethods)
                },
            ]
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Youlite v2.4.1</Text>
                </View>

                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name={section.icon as any} size={20} color={Colors.PRIMARY} />
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>

                        <View style={styles.sectionItems}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.item,
                                        itemIndex === section.items.length - 1 && { borderBottomWidth: 0 }
                                    ]}
                                    onPress={item.type === 'switch' ? undefined : item.action}
                                >
                                    <View style={styles.itemLeft}>
                                        <MaterialIcons name={item.icon as any} size={22} color="#666" />
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                    </View>

                                    <View style={styles.itemRight}>
                                        {item.type === 'switch' ? (
                                            <Switch
                                                value={item.value}
                                                onValueChange={item.action}
                                                trackColor={{ false: '#767577', true: Colors.PRIMARY }}
                                                thumbColor={item.value ? '#f5f5f5' : '#f4f3f4'}
                                            />
                                        ) : (
                                            <Ionicons name="chevron-forward" size={20} color="#999" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2023 Youlite. All rights reserved.</Text>
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
        paddingHorizontal: 16,
    },
    versionContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    versionText: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    sectionItems: {
        paddingHorizontal: 16,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    footerText: {
        fontSize: 12,
        color: '#999',
    },
});

export default Setting;