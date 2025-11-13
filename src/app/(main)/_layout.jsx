import { View, Text } from 'react-native'
import React from 'react'
import { Drawer } from "expo-router/drawer"

const DrawerLayout = () => {
  return (
    <Drawer screenOptions={{headerShown:false}}>
        <Drawer.Screen name='(tabs)' options={{
          title:"Home",
          drawerLabel:"Quiz"
        }}/>
    </Drawer>
  )
}

export default DrawerLayout