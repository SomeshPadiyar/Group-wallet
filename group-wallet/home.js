import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
// To use gradients, you need to install expo-linear-gradient
// Run: expo install expo-linear-gradient
import { LinearGradient } from 'expo-linear-gradient';

// --- DUMMY DATA ---
const userInfo = {
    name: 'Ramesh',
};

const groupData = [
    {
        id: '1',
        name: 'Shimla Trip Group',
        icon: 'https://placehold.co/60x60/A8D5E2/333333?text=🏞️',
        colors: ['#56B4D3', '#348F9D'],
    },
    {
        id: '2',
        name: 'Monthly Expenditure',
        icon: 'https://placehold.co/60x60/FFC3A0/333333?text=🧾',
        colors: ['#FF8A65', '#F4511E'],
    },
    {
        id: '3',
        name: 'Ganesh Utsav',
        icon: 'https://placehold.co/60x60/FFAB91/333333?text=🕉️',
        colors: ['#C371DE', '#A043BF'],
    },
];
// --- END DUMMY DATA ---

// --- UI Components ---
const GroupCard = ({ group }) => (
    <TouchableOpacity>
        <LinearGradient colors={group.colors} style={styles.groupCard}>
            <Image source={{ uri: group.icon }} style={styles.groupIcon} />
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.arrowIcon}>{'>'}</Text>
        </LinearGradient>
    </TouchableOpacity>
);

const BottomNavItem = ({ iconName, label, isFocused }) => (
    <TouchableOpacity style={styles.navItem}>
        {/* In a real app, you would use an icon library like @expo/vector-icons */}
        <Text style={[styles.navIcon, isFocused && styles.navItemFocused]}>{iconName}</Text>
        <Text style={[styles.navLabel, isFocused && styles.navItemFocused]}>{label}</Text>
    </TouchableOpacity>
);


const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoContainer}>
                        {/* Placeholder for App Logo */}
                        <Text style={styles.logoText}>GW</Text>
                    </View>
                    <Text style={styles.headerTitle}>Group Wallet</Text>
                </View>
                <View style={styles.headerRight}>
                    {/* Placeholders for Notification and Search Icons */}
                    <TouchableOpacity>
                        <Text style={styles.headerIcon}>🔔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.headerIcon}>🔍</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.greeting}>Hi {userInfo.name},</Text>

                {groupData.map(group => (
                    <GroupCard key={group.id} group={group} />
                ))}
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab}>
                {/* Placeholder for Group Icon */}
                <Text style={styles.fabIcon}>👥</Text>
            </TouchableOpacity>

            {/* Bottom Tab Navigator Placeholder */}
            <View style={styles.bottomNav}>
                <BottomNavItem iconName="🏠" label="Home" isFocused={true} />
                <BottomNavItem iconName="⏳" label="Pending" />
                <BottomNavItem iconName="💲" label="Transactions" />
                <BottomNavItem iconName="👤" label="Profile" />
            </View>
        </SafeAreaView>
    );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A202C',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        fontSize: 24,
        marginLeft: 20,
        color: '#4A5568',
    },
    scrollViewContent: {
        padding: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 20,
    },
    groupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    groupIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    groupName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    arrowIcon: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E91E63',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 65,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        paddingBottom: 5, // For notch spacing
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navIcon: {
        fontSize: 22,
        color: '#718096',
    },
    navLabel: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4,
    },
    navItemFocused: {
        color: '#4A90E2',
    }
});

export default HomeScreen;

