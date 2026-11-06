// jsdom has no matchMedia, which react-native-web and Reanimated read for color scheme and reduced motion.
window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
