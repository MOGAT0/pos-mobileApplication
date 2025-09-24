import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { clearUser } from '../components/ss_login';

const MainScreen = ({ navigation }) => {
    const router = useRouter();

    const handleLogout = async ()=>{
        
        clearUser();
        router.dismissAll();
    }

    return( 
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTxt}>Home</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutTxt}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => router.push("newTransaction")} style={styles.buttonWrap}>
                    <LinearGradient
                        colors={['#6441A5','#2a0845']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.btnTxt}>New Transaction</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push("ongoingTransactions")} style={styles.buttonWrap}>
                    <LinearGradient
                        colors={['#6441A5','#2a0845']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        <Text style={styles.btnTxt}>Ongoing Transactions</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}
export default MainScreen;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 15,
    },
    header:{
        flexDirection: "row",
        justifyContent: "space-between", // puts Home left, Logout right
        alignItems: "center",
        paddingHorizontal:20,
        paddingVertical:10,
    },
    headerTxt:{
        fontSize: 30,
        fontWeight: '600'
    },
    logoutBtn:{
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#332277",
        borderRadius: 8,
    },
    logoutTxt:{
        fontSize: 16,
        fontWeight: "600",
        color: "#fff"
    },
    buttonContainer:{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20
    }, 
    buttonWrap: {
        borderRadius: 10,
        marginVertical: 20,
        overflow: 'hidden',
    },
    button:{
        backgroundColor: '#5C6BC0',
        paddingVertical: 60,
        borderRadius: 10,
        marginVertical: 20,
        alignItems: 'center',
        elevation: 4
    },
    btnTxt:{
        color: '#e3d9ff',
        fontSize: 20,
        fontWeight: "500"
    }
})
