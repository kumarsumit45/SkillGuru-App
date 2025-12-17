import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../../../constants/colors";
import BarIcons from "../../../constants/Icons";
import DrawerToggle from "../../../components/drawerToggle"
import { Ionicons,Octicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';

const Tablayout = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: "#1976D2", //colors.primary,
        tabBarActiveTintColor:COLORS.Purple.primary ,//"#1976D2", // colors.primary,
        tabBarInactiveTintColor: "#0d2b43", // colors.textDark,
        tabBarStyle: {
          height: 70 + insets.bottom,
          backgroundColor: COLORS.background,
          paddingTop: 5,
          paddingBottom: insets.bottom,
        },
      }}
    >
      {/* <Tabs.Screen
        name="createQuiz"
        options={{
          title: "Create Quiz",
          headerLeft: () => <DrawerToggle />,
          tabBarLabel: "Create Quiz",
          tabBarIcon:()=>(
            <Image source={BarIcons.createQuiz} style={{height:25,width:25}} contentFit="contain" />
          )
        }}
        
      /> */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Live Quiz",
          tabBarLabel: "Live Quiz",
          tabBarIcon:({ color, size })=>(
            // <Image source={BarIcons.dailyQuiz} style={{height:25,width:25}} contentFit="contain" />
            <Octicons name="goal" size={28} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarLabel: "Courses",
          tabBarIcon:({ color, size })=>(
            // <Image source={BarIcons.history} style={{height:25,width:25}} contentFit="contain" />
            <Ionicons name="color-filter" size={28} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon:({ color, size })=>(
            // <Image source={BarIcons.topCreator} style={{height:25,width:25}} contentFit="contain" />
            <Octicons name="feed-person" size={28} color={color} />
          )
        }}
      />
      {/* <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarLabel: "Earnings",
          tabBarIcon:()=>(
            <Image source={BarIcons.earnings} style={{height:25,width:25}} contentFit="contain" />
          ),
        }}
      /> */}
    </Tabs>
  );
};

export default Tablayout;

