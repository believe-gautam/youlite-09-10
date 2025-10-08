import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define types
type TransactionStatus = 'completed' | 'refunded' | 'failed' | 'pending';
type PaymentMethodType = 'card' | 'paypal';
type FilterType = 'all' | TransactionStatus;

interface PaymentMethod {
  id: number;
  type: PaymentMethodType;
  lastFour?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: TransactionStatus;
  method: string;
  orderId: string;
  items: number;
}

const Payments = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const paymentMethods: PaymentMethod[] = [
    { id: 1, type: 'card', lastFour: '4589', brand: 'Visa', isDefault: true },
    { id: 2, type: 'card', lastFour: '7632', brand: 'Mastercard', isDefault: false },
    { id: 3, type: 'paypal', email: 'user@example.com', isDefault: false },
  ];

  const transactions: Transaction[] = [
    {
      id: 'TXN-78945',
      date: '15 Aug 2023',
      amount: '$89.99',
      status: 'completed',
      method: 'Visa ****4589',
      orderId: 'ORD-78945',
      items: 3,
    },
    {
      id: 'TXN-78944',
      date: '10 Aug 2023',
      amount: '$45.50',
      status: 'completed',
      method: 'Mastercard ****7632',
      orderId: 'ORD-78944',
      items: 2,
    },
    {
      id: 'TXN-78943',
      date: '05 Aug 2023',
      amount: '$32.99',
      status: 'refunded',
      method: 'PayPal',
      orderId: 'ORD-78943',
      items: 1,
    },
    {
      id: 'TXN-78942',
      date: '02 Aug 2023',
      amount: '$25.99',
      status: 'completed',
      method: 'Visa ****4589',
      orderId: 'ORD-78942',
      items: 1,
    },
    {
      id: 'TXN-78941',
      date: '28 Jul 2023',
      amount: '$120.45',
      status: 'failed',
      method: 'Mastercard ****7632',
      orderId: 'ORD-78941',
      items: 4,
    },
    {
      id: 'TXN-78940',
      date: '25 Jul 2023',
      amount: '$67.80',
      status: 'completed',
      method: 'Visa ****4589',
      orderId: 'ORD-78940',
      items: 2,
    },
  ];

  const filteredTransactions = activeFilter === 'all'
    ? transactions
    : transactions.filter(tx => tx.status === activeFilter);

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case 'completed': return '#28A745';
      case 'refunded': return '#17A2B8';
      case 'failed': return '#DC3545';
      case 'pending': return '#FFC107';
      default: return '#6C757D';
    }
  };

  const getStatusIcon = (status: TransactionStatus): string => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'refunded': return 'refresh-circle';
      case 'failed': return 'close-circle';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  const formatAmount = (amount: string): string => {
    return amount.replace('$', '');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Methods Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            {/* <TouchableOpacity onPress={() => router.push('/settings/payments')}>
              <Text style={styles.seeAll}>Manage</Text>
            </TouchableOpacity> */}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  {method.type === 'card' ? (
                    <MaterialIcons name="credit-card" size={24} color={Colors.PRIMARY} />
                  ) : (
                    <Ionicons name="logo-paypal" size={24} color="#0070BA" />
                  )}
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardDetails}>
                  {method.type === 'card' ? (
                    <>
                      <Text style={styles.cardBrand}>{method.brand}</Text>
                      <Text style={styles.cardNumber}>**** {method.lastFour}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.cardBrand}>PayPal</Text>
                      <Text style={styles.cardNumber}>{method.email}</Text>
                    </>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['all', 'completed', 'pending', 'refunded', 'failed'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No {activeFilter !== 'all' ? activeFilter : ''} transactions found</Text>
            </View>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index === filteredTransactions.length - 1 && { borderBottomWidth: 0 }
                ]}
                // onPress={() => router.push(`/payment-details/${transaction.id}`)}
              >
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.statusIconContainer,
                    { backgroundColor: `${getStatusColor(transaction.status)}15` }
                  ]}>
                    <Ionicons
                      name={getStatusIcon(transaction.status) as any}
                      size={20}
                      color={getStatusColor(transaction.status)}
                    />
                  </View>
                  <View>
                    <Text style={styles.transactionId}>{transaction.id}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                    <Text style={styles.transactionMethod}>{transaction.method}</Text>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text style={styles.transactionAmount}>${formatAmount(transaction.amount)}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(transaction.status)}15` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(transaction.status) }
                    ]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${transactions
              .filter(tx => tx.status === 'completed')
              .reduce((sum, tx) => sum + parseFloat(formatAmount(tx.amount)), 0)
              .toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {transactions.filter(tx => tx.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Dimenstion.headerHeight
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  card: {
    width: 160,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  defaultBadge: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDetails: {
    marginTop: 4,
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    marginTop: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.WHITE,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
});

export default Payments;