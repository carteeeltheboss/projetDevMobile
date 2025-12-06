import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import linking from './LinkingConfiguration';
import DashboardScreen from '../screens/DashboardScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import TodoScreen from '../screens/TodoScreen';
import SharedTodoScreen from '../screens/SharedTodoScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f6f7fb',
  },
};

export default function AppNavigator() {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'MyStudyCompanion' }} />
        <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Full Schedule' }} />
        <Stack.Screen name="Todo" component={TodoScreen} options={{ title: 'Todo List' }} />
        <Stack.Screen name="SharedTodo" component={SharedTodoScreen} options={{ title: 'Shared Todo List' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
