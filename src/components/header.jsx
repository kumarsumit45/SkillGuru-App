import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'

const Header = ({bgr='#fff'}) => {
  return (
    <View style={[styles.header,{backgroundColor:bgr}]}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} contentFit="cover" />
        <Text style={styles.headerTitle}>Skill Guru</Text>
      </View>
  )
}
const styles = StyleSheet.create({
    header: {
    // backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
  },
  logo:{
    height:50,
    width:50,
    left:-20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    left:-15,
  },

})
export default Header