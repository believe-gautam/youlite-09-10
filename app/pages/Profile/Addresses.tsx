import Colors from '@/utils/Colors';
import Dimenstion from '@/utils/Dimenstion';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Added import for router
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


// Define the Address type
interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}


const Addresses = () => {
  const router = useRouter(); // Added router instance

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      phone: '+1 (555) 123-4567',
      isDefault: true
    },
    {
      id: '2',
      name: 'John Doe',
      street: '456 Park Avenue',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'United States',
      phone: '+1 (555) 987-6543',
      isDefault: false
    }
  ]);


  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');


  const resetForm = () => {
    setName('');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
    setPhone('');
    setCurrentAddress(null);
    setEditMode(false);
  };


  const handleAddAddress = () => {
    resetForm();
    setModalVisible(true);
  };


  const handleEditAddress = (address: Address) => {
    setEditMode(true);
    setCurrentAddress(address);
    setName(address.name);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
    setCountry(address.country);
    setPhone(address.phone);
    setModalVisible(true);
  };


  const handleSaveAddress = () => {
    if (!name || !street || !city || !state || !zipCode || !country || !phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }


    const newAddress: Address = {
      id: editMode && currentAddress ? currentAddress.id : Math.random().toString(),
      name,
      street,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault: editMode && currentAddress ? currentAddress.isDefault : false
    };


    if (editMode && currentAddress) {
      setAddresses(addresses.map(addr =>
        addr.id === currentAddress.id ? newAddress : addr
      ));
    } else {
      setAddresses([...addresses, newAddress]);
    }


    setModalVisible(false);
    resetForm();
  };


  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== id));
          }
        }
      ]
    );
  };


  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };


  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.name}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>


      <Text style={styles.addressText}>{item.street}</Text>
      <Text style={styles.addressText}>{item.city}, {item.state} {item.zipCode}</Text>
      <Text style={styles.addressText}>{item.country}</Text>
      <Text style={styles.addressText}>{item.phone}</Text>


      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAddress(item)}
        >
          <Ionicons name="pencil-outline" size={18} color={Colors.PRIMARY} />
          <Text style={[styles.actionText, { color: Colors.PRIMARY }]}>Edit</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#e74c3c" />
          <Text style={[styles.actionText, { color: '#e74c3c' }]}>Delete</Text>
        </TouchableOpacity>


        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="star-outline" size={18} color="#f39c12" />
            <Text style={[styles.actionText, { color: '#f39c12' }]}>Set Default</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 24 }} />
      </View>


      <View style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>


        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Edit Address' : 'Add New Address'}
            </Text>


            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />


              <TextInput
                style={styles.input}
                placeholder="Street Address"
                placeholderTextColor="#999"
                value={street}
                onChangeText={setStreet}
              />


              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="City"
                  placeholderTextColor="#999"
                  value={city}
                  onChangeText={setCity}
                />


                <TextInput
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="State"
                  placeholderTextColor="#999"
                  value={state}
                  onChangeText={setState}
                />
              </View>


              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flex1]}
                  placeholder="ZIP Code"
                  placeholderTextColor="#999"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                />


                <TextInput
                  style={[styles.input, styles.flex1, styles.marginLeft]}
                  placeholder="Country"
                  placeholderTextColor="#999"
                  value={country}
                  onChangeText={setCountry}
                />
              </View>


              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </ScrollView>


            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveAddress}
              >
                <Text style={styles.saveButtonText}>
                  {editMode ? 'Update Address' : 'Save Address'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  defaultBadge: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    marginLeft: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});


export default Addresses;
