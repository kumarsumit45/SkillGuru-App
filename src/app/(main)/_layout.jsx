import { View, Text } from 'react-native'
import React from 'react'
import { Drawer } from "expo-router/drawer"

const DrawerLayout = () => {
  return (
    <Drawer>
        <Drawer.Screen name='(tabs)' />
    </Drawer>
  )
}

export default DrawerLayout