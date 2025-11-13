import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

const Tablayout = () => {
  return (
    <Tabs>
        <Tabs.Screen name='index' />
        <Tabs.Screen name='dailyQuiz' />
        <Tabs.Screen name='myHistroy' />
        <Tabs.Screen name='creators' />
        <Tabs.Screen name='earnings' />
    </Tabs>
  )
}

export default Tablayout