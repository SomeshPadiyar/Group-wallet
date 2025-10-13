import React, { useState, useRef, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal, // New import for country picker
  FlatList, // New import for listing countries
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- DATA (EXPANDED LIST) ---
const COUNTRY_DATA = [
  { flag: '🇮🇳', code: '91', name: 'India' },
  { flag: '🇧🇩', code: '880', name: 'Bangladesh' }, // Added country
  { flag: '🇳🇵', code: '977', name: 'Nepal' }, // Added country
  { flag: '🇪🇹', code: '251', name: 'Ethiopia' }, // Added country
  { flag: '🇺🇸', code: '1', name: 'United States' },
  { flag: '🇬🇧', code: '44', name: 'United Kingdom' },
  { flag: '🇨🇦', code: '1', name: 'Canada' },
  { flag: '🇦🇺', code: '61', name: 'Australia' },
  { flag: '🇩🇪', code: '49', name: 'Germany' },
  { flag: '🇫🇷', code: '33', name: 'France' },
  { flag: '🇯🇵', code: '81', name: 'Japan' },
  { flag: '🇧🇷', code: '55', 'name': 'Brazil' },
  { flag: '🇰🇷', code: '82', name: 'South Korea' },
  { flag: '🇲🇽', code: '52', name: 'Mexico' },
  { flag: '🇳🇬', code: '234', name: 'Nigeria' },
  { flag: '🇿🇦', code: '27', name: 'South Africa' },
  { flag: '🇪🇸', code: '34', name: 'Spain' },
  { flag: '🇮🇹', code: '39', name: 'Italy' },
  { flag: '🇨🇳', code: '86', name: 'China' },
  { flag: '🇵🇰', code: '92', name: 'Pakistan' },
  { flag: '🇦🇪', code: '971', name: 'UAE' },
];

// --- COLORS ---
const COLORS = {
  primaryBlue: '#36A0E3',
  darkNavy: '#002E6E',
  buttonTeal: '#3498DB',
  white: '#FFFFFF',
  textGray: '#555555',
  errorRed: '#E74C3C',
  successGreen: '#2ECC71',
  lightGray: '#F0F0F0',
  borderColor: '#D0D0D0',
};

// --- UI COMPONENTS ---

const LogoSection = memo(() => (
  <View style={styles.logoContainer}>
    <Text style={styles.icon}>👥</Text> 
    <Text style={styles.title}>GROUP WALLET</Text>
    <Text style={styles.subtitle}>
      Making your group transaction transparent
    </Text>
  </View>
));

// Extracted and Memoized Mobile Input Screen for keyboard stability
const MobileInputScreen = memo(({
    mobileNumber,
    setMobileNumber,
    selectedCountry,
    setIsPickerVisible,
    handleMobileInput,
    isLoading,
    error,
    mobileInputRef,
    setError,
}) => (
  <View style={styles.contentCard}>
    <Text style={styles.heading}>Enter Your Mobile Number</Text>
    <Text style={styles.description}>
      We will send you a confirmation code
    </Text>

    <View style={styles.inputRow}>
      {/* Country Code Picker Button */}
      <TouchableOpacity
          style={styles.countryCodeBox}
          onPress={() => setIsPickerVisible(true)}
          activeOpacity={0.8}
      >
        <Text style={styles.countryCodeEmoji}>{selectedCountry.flag}</Text>
        <Text style={styles.countryCodePrefix}>+{selectedCountry.code}</Text>
      </TouchableOpacity>

      {/* Mobile Number Input */}
      <TextInput
        ref={mobileInputRef} // Assign ref
        style={[styles.textInput, error && styles.textInputError]}
        onChangeText={(text) => {
          // Robust text filtering remains here
          const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 10);
          setMobileNumber(cleanedText);
          setError(null);
        }}
        value={mobileNumber}
        placeholder="984 4567891"
        keyboardType="numeric"
        maxLength={10}
      />
    </View>

    {error && <Text style={styles.errorText}>{error}</Text>}

    <TouchableOpacity
      style={[styles.button, (isLoading || mobileNumber.length !== 10) && styles.buttonDisabled]}
      onPress={handleMobileInput}
      disabled={isLoading || mobileNumber.length !== 10}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.buttonText}>Verify</Text>
      )}
    </TouchableOpacity>
  </View>
));

const CountryPickerModal = memo(({
    isPickerVisible,
    setIsPickerVisible,
    selectCountry,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter the list based on the search term (case-insensitive)
    const filteredData = COUNTRY_DATA.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm)
    );

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPickerVisible}
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>Select Country Code</Text>
            
            {/* Search Input for filtering the list */}
            <TextInput
              style={modalStyles.searchInput}
              placeholder="Search country name or code..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={COLORS.textGray}
            />

            <FlatList
              data={filteredData} // Use filtered data
              keyExtractor={(_, index) => index.toString()} 
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={modalStyles.countryItem}
                  onPress={() => selectCountry(item)}
                >
                  <Text style={modalStyles.countryText}>{item.flag} {item.name}</Text>
                  <Text style={modalStyles.countryCodeText}>+{item.code}</Text>
                </TouchableOpacity>
              )}
              style={{ width: '100%' }}
            />
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => setIsPickerVisible(false)}
            >
              <Text style={modalStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
});

const OTPScreen = memo(({
    otpCode,
    // Updated: Now accepts ref and focus handler
    handleOtpInput, 
    handleOtpFocus, 
    handleOtpVerification,
    isLoading,
    error,
    setError,
    setOtpCode,
    setCurrentScreen,
    setMobileNumber,
}) => {
    // Ref array for the OTP input boxes
    const otpInputs = useRef([]);
    
    // Updated: Create a stable focus handler inside OTPScreen
    const handleFocusNext = useCallback((index, value) => {
        if (value && index < otpCode.length - 1) {
            otpInputs.current[index + 1].focus();
        }
    }, [otpCode]);

    return (
      <View style={styles.contentCard}>
        <Text style={styles.heading}>Enter Verification Code</Text>
        <Text style={styles.description}>
          We Are Automatically detecting a SMS Sent to your Number
        </Text>

        <View style={styles.otpContainer}>
          {otpCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpInputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => {
                  // 1. Update the state via the parent handler
                  handleOtpInput(index, value); 
                  // 2. Trigger the focus logic
                  handleFocusNext(index, value);
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
                  otpInputs.current[index - 1].focus();
                }
              }}
              keyboardType="numeric"
              maxLength={1}
              caretHidden={true}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.button,
            { marginTop: 40 },
            (isLoading || otpCode.join('').length < 4) && styles.buttonDisabled,
          ]}
          onPress={() => handleOtpVerification(otpCode.join(''))}
          disabled={isLoading || otpCode.join('').length < 4}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Confirm</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => {
              setCurrentScreen('mobileInput');
              setMobileNumber('');
              setOtpCode(['', '', '', '']);
              setError(null);
          }}
        >
          <Text style={styles.resendText}>Wrong number? Go back</Text>
        </TouchableOpacity>
      </View>
    );
});


const SuccessScreen = memo(() => (
  <View style={styles.contentCard}>
    <Text style={[styles.heading, { textAlign: 'center' }]}>
      SUCCESSFULLY VERIFIED...
    </Text>
    <View style={styles.successCircle}>
      <Text style={styles.successCheck}>✓</Text>
    </View>
    <Text style={[styles.description, { textAlign: 'center', marginTop: 30 }]}>
      You can now access your Group Wallet.
    </Text>
    <TouchableOpacity
      style={[styles.button, { marginTop: 40 }]}
      onPress={() => console.log('Navigate to Home Screen')}
    >
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>
  </View>
));

// Main component that controls the state and flow
const AuthFlow = () => {
  const [currentScreen, setCurrentScreen] = useState('mobileInput');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_DATA[0]); // Default to India
  const [isPickerVisible, setIsPickerVisible] = useState(false); // State for modal visibility
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mobileInputRef = useRef(null); // Ref for mobile number input

  // --- HANDLERS ---
  // Memoize handlers to ensure they have stable references for memoized components

  const handleMobileInput = useCallback(() => {
    setError(null);
    const validMobile = /^\d{10}$/.test(mobileNumber);
    if (!validMobile) {
      setError('Enter a valid 10-digit mobile number!');
      return;
    }
    console.log(`Sending mobile number: +${selectedCountry.code}${mobileNumber}`);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentScreen('otpVerification');
    }, 1500);
  }, [mobileNumber, selectedCountry.code]);

  // Updated: Simplified handleOtpInput to only manage state, focus logic moved to OTPScreen
  const handleOtpInput = useCallback((index, value) => {
    setError(null);
    setOtpCode(prevOtpCode => {
        const newOtpCode = [...prevOtpCode];
        if (value.length > 1) return prevOtpCode;
        newOtpCode[index] = value.replace(/[^0-9]/g, ''); // Ensure only numbers
        return newOtpCode;
    });
  }, []);

  const handleOtpVerification = useCallback((code) => {
    setIsLoading(true);
    if (code === '1234') { 
      setTimeout(() => {
        setIsLoading(false);
        setCurrentScreen('success');
      }, 2000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Invalid verification code. Try again!');
        setOtpCode(['', '', '', '']);
        // Refocus handled in OTPScreen
      }, 2000);
    }
  }, []);

  const selectCountry = useCallback((country) => {
    setSelectedCountry(country);
    setIsPickerVisible(false);
    // After selection, manually re-focus the mobile number input
    setTimeout(() => {
        mobileInputRef.current?.focus();
    }, 100); 
  }, []);

  // --- MAIN RENDER ---

  const renderScreen = () => {
    switch (currentScreen) {
      case 'mobileInput':
        return (
          <MobileInputScreen 
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            selectedCountry={selectedCountry}
            setIsPickerVisible={setIsPickerVisible}
            handleMobileInput={handleMobileInput}
            isLoading={isLoading}
            error={error}
            mobileInputRef={mobileInputRef}
            setError={setError}
          />
        );
      case 'otpVerification':
        return (
          <OTPScreen 
            otpCode={otpCode}
            handleOtpInput={handleOtpInput}
            handleOtpVerification={handleOtpVerification}
            isLoading={isLoading}
            error={error}
            setError={setError}
            setOtpCode={setOtpCode}
            setCurrentScreen={setCurrentScreen}
            setMobileNumber={setMobileNumber}
          />
        );
      case 'success':
        return <SuccessScreen />;
      default:
        return <MobileInputScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.wavyBackgroundTop} />
        <View style={styles.wavyBackgroundBottom} />

        <View style={styles.contentWrapper}>
          <LogoSection />
          {renderScreen()}
        </View>
      </KeyboardAvoidingView>
      <CountryPickerModal 
        isPickerVisible={isPickerVisible}
        setIsPickerVisible={setIsPickerVisible}
        selectCountry={selectCountry}
      />
    </SafeAreaView>
  );
};

// --- STYLESHEET (Remains unchanged) ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryBlue,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wavyBackgroundTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 150,
    backgroundColor: COLORS.primaryBlue,
  },
  wavyBackgroundBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    backgroundColor: COLORS.primaryBlue,
  },
  contentWrapper: {
    flex: 1,
    width: '90%',
    maxWidth: 400,
    paddingVertical: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40, 
    marginTop: 50,
  },
  icon: {
    fontSize: 80,
    color: COLORS.darkNavy,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.darkNavy,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.darkNavy,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
    maxWidth: 250,
  },
  contentCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 100,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkNavy,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  // Country Code Picker Button
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 1,
    borderColor: COLORS.borderColor,
    height: 50,
    justifyContent: 'center',
    width: 100,
  },
  countryCodeEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodePrefix: {
    fontSize: 16,
    color: COLORS.darkNavy,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    color: COLORS.darkNavy,
  },
  textInputError: {
    borderColor: COLORS.errorRed,
    borderLeftWidth: 1,
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.buttonTeal,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  otpInput: {
    width: width * 0.15,
    height: width * 0.15,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkNavy,
  },
  resendButton: {
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    color: COLORS.buttonTeal,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: COLORS.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  successCheck: {
    fontSize: 70,
    color: COLORS.successGreen,
    fontWeight: '300',
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '100%',
    maxHeight: height * 0.7,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkNavy,
    marginBottom: 15,
  },
  searchInput: {
    width: '100%',
    height: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    width: '100%',
  },
  countryText: {
    fontSize: 16,
    color: COLORS.darkNavy,
    flex: 1,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.buttonTeal,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: COLORS.buttonTeal,
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AuthFlow;
