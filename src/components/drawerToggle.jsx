import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native'
import { DrawerActions } from '@react-navigation/native'
import COLORS from "../constants/colors";

const DrawerToggle = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    //   style={{ marginLeft: 0, marginTop: 0 }}
    >
      <Ionicons name="menu" size={32} color={COLORS.Purple.primary} />
    </TouchableOpacity>
  );
}

export default DrawerToggle