import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, DevSettings, Linking } from 'react-native';
import { createTheme, defaultTheme, FerruleProvider, I18nManager, Platform, ScrollView, StatusBar, useBreakpoint, useInsets, useTheme, View, type ThemeOverrides } from 'ferrule';
import { Badge } from '../../components/ui/badge';
import { Button, IconButton } from '../../components/ui/button';
import { Icon } from '../../components/ui/icon';
import { Input } from '../../components/ui/input';
import { ListItem } from '../../components/ui/list';
import { Sheet } from '../../components/ui/sheet';
import { Text } from '../../components/ui/text';
import { ToastProvider } from '../../components/ui/toast';
import { customOverrides } from '../../ferrule.theme';
import { CATALOG, findEntry, GROUPS, type CatalogEntry } from '../catalog';
import { HarnessContext, TEXT_SCALES, useHarness, type PaletteChoice, type Settings } from './context';
import { colorsOf, Controls } from './Controls';

type Read = (key: string) => string | null;

/** One parser for web's query string and native's deep links, so both take the same parameters. */
function fromLink(read: Read): Partial<Settings> {
  const next: Partial<Settings> = {};
  const mode = read('mode');
  if (mode === 'light' || mode === 'dark') next.mode = mode;
  const palette = read('palette');
  if (palette && (palette === 'custom' || palette in defaultPalettes)) next.palette = palette as PaletteChoice;
  const native = read('native');
  if (native) next.native = native !== '0';
  const text = Number(read('text'));
  if ((TEXT_SCALES as readonly number[]).includes(text)) next.textScale = text;
  const dir = read('dir');
  if (dir) next.rtl = dir === 'rtl';
  return next;
}
const defaultPalettes = Object.fromEntries(['verdigris', 'cobalt', 'madder', 'vermilion', 'saffron', 'plum', 'graphite'].map((name) => [name, true]));
const webQuery = new URLSearchParams(Platform.OS === 'web' ? window.location.search : '');
const readUrl = (url?: string | null): Read => (key) => url?.match(new RegExp(`[?&]${key}=([\\w.-]+)`))?.[1] ?? null;

const scaled = (sizes: Record<string, number>, by: number) => Object.fromEntries(Object.entries(sizes).map(([key, value]) => [key, Math.round(value * by)]));

function summary({ palette, mode, rtl, native, textScale }: Settings) {
  return [palette, mode, rtl ? 'RTL' : 'LTR', native ? 'native on' : 'native off', `${textScale}x`].join(' · ');
}

function Catalog({ onOpen, current }: { onOpen: (id: string) => void; current: string | null }) {
  const { colors, tokens } = useTheme();
  const [search, setSearch] = useState('');
  // Deferred so re-rendering the list never holds up typing: fast typing lost characters on iOS without it.
  const terms = useDeferredValue(search).toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (item: CatalogEntry) => terms.every((term) => `${item.id} ${item.title} ${item.blurb} ${item.group}`.toLowerCase().includes(term));
  const shown = CATALOG.filter(matches);
  return (
    <>
      <View style={{ paddingHorizontal: tokens.space[4], paddingBottom: tokens.space[3] }}>
        <Input testID="catalog-search" aria-label="Search components" placeholder={`Search ${CATALOG.length} screens`} value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} start={<Icon name="search" size={18} />} />
      </View>
      <ScrollView testID="catalog-scroll" style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: tokens.space[8] }}>
        {GROUPS.map((group) => {
          const items = shown.filter((item) => item.group === group);
          if (!items.length) return null;
          return (
            <View key={group}>
              <View style={{ paddingHorizontal: tokens.space[4], paddingTop: tokens.space[4], paddingBottom: tokens.space[1] }}>
                <Text variant="caption" tone="muted" role="heading">{group}</Text>
              </View>
              {items.map((item) => (
                <ListItem
                  key={item.id}
                  testID={`open-${item.id}`}
                  title={item.title}
                  description={item.blurb}
                  selected={item.id === current}
                  end={item.NativeDemo ? <Badge tone="primary">Native</Badge> : undefined}
                  onPress={() => onOpen(item.id)}
                />
              ))}
            </View>
          );
        })}
        {shown.length ? null : (
          <View style={{ padding: tokens.space[6], gap: tokens.space[3], alignItems: 'flex-start' }}>
            <Text tone="muted">Nothing is called that. Search by name, group or what it does.</Text>
            <Button variant="outline" size="sm" onPress={() => setSearch('')}>Clear search</Button>
          </View>
        )}
      </ScrollView>
      {/* Keeps a hairline between a long list and the device's own bottom edge. */}
      <View style={{ height: 1, backgroundColor: colors.border }} />
    </>
  );
}

function DemoBody({ item }: { item: CatalogEntry }) {
  const { only, log } = useHarness();
  const { Demo, NativeDemo } = item;
  const nativeOnly = item.group === 'Native only';
  return (
    <>
      {NativeDemo ? <Text testID="native-log" variant="caption" tone="muted">Last native event: {log}</Text> : null}
      {only ? null : <Demo />}
      {NativeDemo && !nativeOnly ? <NativeDemo /> : null}
    </>
  );
}

function Detail({ item, onBack }: { item: CatalogEntry; onBack?: () => void }) {
  const { tokens } = useTheme();
  const insets = useInsets();
  const { palette } = useHarness();
  const footer = <Text variant="caption" tone="muted" testID="platform-line">{`${Platform.OS === 'web' ? 'web' : `${Platform.OS} ${Platform.Version}`}, ${palette}`}</Text>;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[2], paddingHorizontal: tokens.space[onBack ? 2 : 4], paddingVertical: tokens.space[2] }}>
        {onBack ? <IconButton testID="detail-back" variant="ghost" aria-label="All components" onPress={onBack}><Icon name="chevron-left" /></IconButton> : null}
        <View style={{ flex: 1 }}>
          <Text testID={`detail-${item.id}`} variant="h2" numberOfLines={1}>{item.title}</Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>{item.blurb}</Text>
        </View>
      </View>
      {item.bounded ? (
        <View style={{ flex: 1, padding: tokens.space[2] }}><item.Demo key={item.id} /></View>
      ) : (
        <ScrollView testID="detail-scroll" {...(Platform.OS === 'web' ? ({ tabIndex: 0 } as object) : null)} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: tokens.space[4], paddingBottom: insets.bottom + tokens.space[8], gap: tokens.space[6], width: '100%', maxWidth: 720 }}>
          <DemoBody key={item.id} item={item} />
          {footer}
        </ScrollView>
      )}
    </View>
  );
}

function Shell({ current, setCurrent }: { current: string | null; setCurrent: (id: string | null) => void }) {
  const { colors, tokens } = useTheme();
  const insets = useInsets();
  const harness = useHarness();
  const wide = useBreakpoint() !== 'base';
  const [controls, setControls] = useState(false);
  const item = findEntry(current);
  const titleBar = (
    <View style={{ paddingHorizontal: tokens.space[4], paddingTop: tokens.space[3], paddingBottom: tokens.space[3], gap: tokens.space[1] }}>
      <Text variant="h1">Ferrule harness</Text>
      {wide ? null : <Text testID="settings-summary" variant="caption" tone="muted">{summary(harness)}</Text>}
    </View>
  );
  const settingsButton = <Button testID="controls-open" size="sm" variant="outline" onPress={() => setControls(true)}>Test controls</Button>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingStart: insets.left, paddingEnd: insets.right }}>
      <StatusBar barStyle={harness.mode === 'dark' ? 'light-content' : 'dark-content'} />
      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 340, borderEndWidth: 1, borderEndColor: colors.border }}>
            {titleBar}
            <View style={{ paddingHorizontal: tokens.space[4], paddingBottom: tokens.space[4] }}><Controls /></View>
            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: tokens.space[3] }} />
            <Catalog current={current} onOpen={setCurrent} />
          </View>
          <View style={{ flex: 1 }}>
            {item ? <Detail key={item.id} item={item} /> : (
              <View style={{ padding: tokens.space[8], gap: tokens.space[2] }}>
                <Text variant="h2">Pick a component</Text>
                <Text tone="muted">Every variant and state it has, in the palette and direction set on the left.</Text>
              </View>
            )}
          </View>
        </View>
      ) : item ? (
        <>
          <Detail key={item.id} item={item} onBack={() => setCurrent(null)} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.space[3], borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: tokens.space[4], paddingTop: tokens.space[2], paddingBottom: insets.bottom + tokens.space[2] }}>
            <Text style={{ flex: 1 }} testID="settings-summary" variant="caption" tone="muted" numberOfLines={2}>{summary(harness)}</Text>
            {settingsButton}
          </View>
        </>
      ) : (
        <>
          {titleBar}
          <View style={{ paddingHorizontal: tokens.space[4], paddingBottom: tokens.space[3], flexDirection: 'row' }}>{settingsButton}</View>
          <Catalog current={current} onOpen={setCurrent} />
          <View style={{ height: insets.bottom }} />
        </>
      )}
      <Sheet open={controls} onOpenChange={setControls} title="Test controls"><Controls /></Sheet>
    </View>
  );
}

export function Harness() {
  const [settings, setSettings] = useState<Settings>(() => ({ mode: 'light', palette: 'verdigris', rtl: Platform.OS !== 'web' && I18nManager.isRTL, native: true, textScale: 1, ...fromLink((key) => webQuery.get(key)) }));
  const [current, setCurrentState] = useState<string | null>(webQuery.get('component'));
  const [only, setOnly] = useState<string | null>(webQuery.get('only'));
  const [log, setLog] = useState('none yet');
  const currentRef = useRef(current);
  currentRef.current = current;

  const setCurrent = (id: string | null) => {
    setCurrentState(id);
    setOnly(null);
    setLog('none yet');
  };

  // Keeps the address bar shareable on web.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const query = new URLSearchParams(window.location.search);
    if (current) query.set('component', current); else query.delete('component');
    window.history.replaceState(null, '', `${window.location.pathname}${query.size ? `?${query}` : ''}`);
  }, [current]);

  // dev.ferrule.harness://?component=button&mode=dark: the same parameters on iOS and Android.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const open = (url?: string | null) => {
      if (!url) return;
      const read = readUrl(url);
      const { rtl, ...next } = fromLink(read);
      setSettings((old) => ({ ...old, ...next }));
      if (url.includes('component=')) setCurrentState(read('component'));
      setOnly(read('only'));
      setLog('none yet');
      if (rtl !== undefined) applyNativeRtl(rtl);
    };
    Linking.getInitialURL().then(open);
    const sub = Linking.addEventListener('url', (event) => open(event.url));
    return () => sub.remove();
  }, []);

  // Android's back button leaves a component before it leaves the app.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!currentRef.current) return false;
      setCurrent(null);
      return true;
    });
    return () => sub.remove();
  }, []);

  const set = (next: Partial<Settings>) => {
    if (next.rtl !== undefined && Platform.OS !== 'web') applyNativeRtl(next.rtl);
    setSettings((old) => ({ ...old, ...next }));
  };

  const theme = useMemo(() => {
    const base: ThemeOverrides = settings.palette === 'custom' ? customOverrides : {};
    if (settings.textScale === 1 && settings.palette !== 'custom') return defaultTheme;
    const tokens = defaultTheme.tokens;
    return createTheme({ ...base, tokens: { ...base.tokens, fontSize: scaled(tokens.fontSize, settings.textScale), lineHeight: scaled(tokens.lineHeight, settings.textScale) } as ThemeOverrides['tokens'] });
  }, [settings.palette, settings.textScale]);

  const value = useMemo(() => ({ ...settings, paletteColors: colorsOf(settings.palette), set, log, setLog, only }), [settings, log, only]);
  return (
    <HarnessContext.Provider value={value}>
      <FerruleProvider theme={theme} palette={settings.palette === 'custom' ? undefined : settings.palette} colorMode={settings.mode} direction={settings.rtl ? 'rtl' : 'ltr'}>
        <ToastProvider>
          <Shell current={current} setCurrent={setCurrent} />
        </ToastProvider>
      </FerruleProvider>
    </HarnessContext.Provider>
  );
}

// Native direction is process-wide, so changing it needs a restart.
function applyNativeRtl(rtl: boolean) {
  if (rtl === I18nManager.isRTL) return;
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(rtl);
  DevSettings.reload();
}
