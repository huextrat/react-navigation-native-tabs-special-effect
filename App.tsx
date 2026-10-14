import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { createStaticNavigation, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

// Flip to false to compare with the JS bottom tabs.
const USE_NATIVE_TABS = true;

const ITEMS = Array.from({ length: 60 }, (_, index) => `Item ${index}`);
const PAGES = ['Page A', 'Page B'];

function Feed() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const lists = useRef<(FlatList<string> | null)[]>([]);
  const page = useRef(0);
  const [log, setLog] = useState('Re-tap the Home tab');

  useEffect(() => {
    // Custom "scroll to top on tab press" for a screen the native scroll-to-top
    // can't handle (here: lists inside a horizontal pager).
    return navigation.getParent()?.addListener('tabPress' as never, (e: any) => {
      const focused = navigation.isFocused();

      if (focused) {
        lists.current[page.current]?.scrollToOffset({ offset: 0, animated: true });
      }

      setLog(
        `isFocused(): ${focused} -> ${focused ? 'scrolled to top' : 'ignored'}\n` +
          `data: ${JSON.stringify(e.data)}`
      );
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.log}>{log}</Text>
      <ScrollView
        horizontal
        pagingEnabled
        onMomentumScrollEnd={(e) => {
          page.current = Math.round(e.nativeEvent.contentOffset.x / width);
        }}
      >
        {PAGES.map((title, index) => (
          <FlatList
            key={title}
            ref={(ref) => {
              lists.current[index] = ref;
            }}
            style={{ width }}
            data={ITEMS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => navigation.navigate('Details' as never)}
              >
                <Text>
                  {title} / {item}
                </Text>
              </Pressable>
            )}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Details() {
  return (
    <View style={styles.center}>
      <Text>Now re-tap the Home tab</Text>
    </View>
  );
}

function Settings() {
  return (
    <View style={styles.center}>
      <Text>Settings</Text>
    </View>
  );
}

const HomeStack = createNativeStackNavigator({
  screens: {
    Feed,
    Details,
  },
});

const icon = (sfSymbol: string) =>
  Platform.OS === 'ios'
    ? { type: 'sfSymbol' as const, name: sfSymbol as never }
    : { type: 'image' as const, source: require('./assets/favicon.png') };

const NativeTabs = createNativeBottomTabNavigator({
  screens: {
    Home: {
      screen: HomeStack,
      options: { tabBarIcon: icon('house') },
    },
    Settings: {
      screen: Settings,
      options: { tabBarIcon: icon('gear') },
    },
  },
});

const JSTabs = createBottomTabNavigator({
  screenOptions: { headerShown: false },
  screens: {
    Home: HomeStack,
    Settings,
  },
});

const Navigation = createStaticNavigation(USE_NATIVE_TABS ? NativeTabs : JSTabs);

export default function App() {
  return <Navigation />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  log: {
    padding: 12,
    backgroundColor: '#ffe9a8',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 12,
  },
  row: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
